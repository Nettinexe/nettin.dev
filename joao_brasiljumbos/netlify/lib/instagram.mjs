/**
 * Núcleo da automação do Instagram — compartilhado entre o endpoint
 * (functions/instagram-feed.mjs) e a rotina agendada
 * (functions/instagram-refresh.mjs).
 *
 *   Instagram → API oficial da Meta → função serverless → cache → site
 *
 * API usada: Instagram API with Instagram Login (graph.instagram.com), a API
 * oficial atual para contas profissionais. A Instagram Basic Display API foi
 * descontinuada pela Meta e NÃO é usada.
 *
 * O token NUNCA chega ao navegador: ele vem da variável de ambiente
 * INSTAGRAM_ACCESS_TOKEN e, depois de renovado, fica guardado no Netlify
 * Blobs (armazenamento privado do site, só acessível pelas funções).
 *
 * VARIÁVEIS DE AMBIENTE (Netlify → Site configuration → Environment variables)
 *   INSTAGRAM_ACCESS_TOKEN   obrigatória — token de longa duração (60 dias)
 *   INSTAGRAM_USER_ID        opcional — id da conta profissional; sem ele usa /me
 *   INSTAGRAM_GRAPH_VERSION  opcional — ex.: "v23.0"; vazio usa a versão padrão
 */
import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

export const CACHE_TTL_MS = 45 * 60 * 1000;            // faixa pedida: 30–60 min
export const TOKEN_REFRESH_AFTER_MS = 5 * 24 * 3600e3; // renova a cada ~5 dias
const FETCH_TIMEOUT_MS = 8000;
const ITEMS_TO_SHOW = 5; // a seção exibe 5 cards lado a lado

const GRAPH_HOST = "https://graph.instagram.com";
const FIELDS = [
  "id", "caption", "media_type", "media_product_type", "media_url",
  "thumbnail_url", "permalink", "timestamp",
  "children{media_type,media_url,thumbnail_url}",
].join(",");

/* ---------------------------------------------------------------------------
   Armazenamento: Netlify Blobs (persiste entre execuções e cold starts).
   Se o Blobs não estiver disponível (ex.: execução local sem site linkado),
   cai num cache em memória — a função continua respondendo.
   --------------------------------------------------------------------------- */
const memory = new Map();

function store() {
  try {
    return getStore("instagram");
  } catch {
    return null;
  }
}

async function readJSON(key) {
  const s = store();
  if (s) {
    try {
      const value = await s.get(key, { type: "json" });
      if (value) return value;
    } catch (err) {
      console.warn(`[instagram] leitura do blob "${key}" falhou:`, err.message);
    }
  }
  return memory.get(key) || null;
}

async function writeJSON(key, value) {
  memory.set(key, value);
  const s = store();
  if (!s) return;
  try {
    await s.setJSON(key, value);
  } catch (err) {
    console.warn(`[instagram] gravação do blob "${key}" falhou:`, err.message);
  }
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      const msg = (body.error && body.error.message) || `HTTP ${res.status}`;
      throw new Error(`Graph API: ${msg}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------------------
   Token de longa duração
   --------------------------------------------------------------------------- */
const fingerprint = (token) => createHash("sha256").update(token).digest("hex").slice(0, 16);

/**
 * Token em uso: o renovado (Blobs) tem prioridade, MAS só enquanto tiver sido
 * derivado do token atual da variável de ambiente. Se alguém trocar a
 * variável (ex.: token revogado e gerado de novo), o novo valor vence.
 */
export async function currentToken() {
  const envToken = (process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
  if (!envToken) return null;
  const saved = await readJSON("token");
  if (saved && saved.token && saved.seed === fingerprint(envToken)) return saved;
  return { token: envToken, seed: fingerprint(envToken), refreshedAt: 0 };
}

/**
 * Renova o token (válido por mais 60 dias a cada renovação). A Meta só
 * aceita renovar tokens com 24h+ de idade e ainda válidos — por isso a
 * rotina agendada tenta com folga, a cada ~5 dias, bem antes do vencimento.
 */
export async function refreshTokenIfDue({ force = false } = {}) {
  const current = await currentToken();
  if (!current) return { refreshed: false, reason: "INSTAGRAM_ACCESS_TOKEN não configurado" };
  /* refreshedAt = 0 → token ainda é o da variável de ambiente: renova já. */
  const recentlyRefreshed = current.refreshedAt && Date.now() - current.refreshedAt < TOKEN_REFRESH_AFTER_MS;
  if (!force && recentlyRefreshed) {
    return { refreshed: false, reason: "ainda não é hora" };
  }

  const url = `${GRAPH_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(current.token)}`;
  const json = await fetchJSON(url);
  if (!json.access_token) throw new Error("Resposta de renovação sem access_token");

  await writeJSON("token", {
    token: json.access_token,
    seed: current.seed,
    refreshedAt: Date.now(),
    expiresAt: Date.now() + (Number(json.expires_in) || 0) * 1000,
  });
  return { refreshed: true, expiresInDays: Math.round((Number(json.expires_in) || 0) / 86400) };
}

/* ---------------------------------------------------------------------------
   Mídia
   --------------------------------------------------------------------------- */
const isInstagramUrl = (u) => typeof u === "string" && /^https:\/\/(www\.)?instagram\.com\//.test(u);
const isHttps = (u) => typeof u === "string" && u.startsWith("https://");

function captionTitle(caption) {
  const firstLine = String(caption || "").split("\n")[0].trim();
  if (!firstLine) return "";
  return firstLine.length > 80 ? firstLine.slice(0, 80).trim() + "…" : firstLine;
}

/** Imagem estática da publicação: thumbnail para vídeo/Reel, nunca o .mp4. */
function thumbnailOf(item) {
  if (item.media_type === "VIDEO") return item.thumbnail_url;
  if (item.media_type === "CAROUSEL_ALBUM") {
    const first = item.children && item.children.data && item.children.data[0];
    if (first) return first.media_type === "VIDEO" ? first.thumbnail_url : first.media_url;
  }
  return item.media_url;
}

/**
 * Normaliza para o formato que o front-end consome. Seleciona os CINCO
 * vídeos/Reels mais recentes (a seção é "Últimos vídeos"); se houver menos
 * de cinco, completa com as publicações mais recentes para a fileira nunca
 * ficar desfalcada. A saída sai em ordem cronológica: mais recente primeiro.
 */
export function normalize(raw) {
  const items = (Array.isArray(raw) ? raw : [])
    .map((item) => ({
      id: item.id,
      type: item.media_product_type === "REELS" ? "reel" : String(item.media_type || "").toLowerCase(),
      isVideo: item.media_type === "VIDEO",
      url: item.permalink,
      thumbnail: thumbnailOf(item),
      title: captionTitle(item.caption),
      timestamp: item.timestamp,
    }))
    .filter((i) => isInstagramUrl(i.url) && isHttps(i.thumbnail));

  const videos = items.filter((i) => i.isVideo);
  const others = items.filter((i) => !i.isVideo);
  const time = (i) => Date.parse(i.timestamp) || 0;
  return videos
    .concat(others)
    .slice(0, ITEMS_TO_SHOW)
    .sort((a, b) => time(b) - time(a))
    .map(({ isVideo, ...rest }) => rest);
}

async function fetchFromGraph() {
  const current = await currentToken();
  if (!current) throw new Error("INSTAGRAM_ACCESS_TOKEN não configurado");

  const version = (process.env.INSTAGRAM_GRAPH_VERSION || "").trim();
  const user = (process.env.INSTAGRAM_USER_ID || "").trim() || "me";
  const base = version ? `${GRAPH_HOST}/${version}` : GRAPH_HOST;
  const url = `${base}/${encodeURIComponent(user)}/media?fields=${encodeURIComponent(FIELDS)}&limit=24&access_token=${encodeURIComponent(current.token)}`;

  const json = await fetchJSON(url);
  return normalize(json.data);
}

/**
 * Cascata de fallback:
 *   1. cache com menos de CACHE_TTL_MS          → devolve o cache
 *   2. API oficial                              → grava o cache e devolve
 *   3. API falhou, mas existe cache (qualquer idade) → devolve o último cache
 *   4. nada disponível                          → items: [] e o front-end usa
 *                                                 o fallback estático
 *                                                 (data/latest-videos.js)
 */
export async function getFeed({ force = false } = {}) {
  const cached = await readJSON("feed");
  const age = cached ? Date.now() - cached.fetchedAt : Infinity;

  /* Cache gravado quando a seção mostrava 3 cards (sem `limit`) não vale
     como "fresco": força nova busca para preencher os 5. Se a API falhar,
     ele ainda serve de último recurso no catch abaixo. */
  const cacheComplete = cached && cached.limit === ITEMS_TO_SHOW;

  if (!force && cacheComplete && age < CACHE_TTL_MS) {
    return { source: "cache", stale: false, fetchedAt: cached.fetchedAt, items: cached.items };
  }

  try {
    const items = await fetchFromGraph();
    if (!items.length) throw new Error("A API não retornou publicações utilizáveis");
    const record = { items, fetchedAt: Date.now(), limit: ITEMS_TO_SHOW };
    await writeJSON("feed", record);
    return { source: "api", stale: false, fetchedAt: record.fetchedAt, items };
  } catch (err) {
    console.warn("[instagram] falha ao buscar na API:", err.message);
    if (cached && cached.items && cached.items.length) {
      return { source: "cache", stale: true, fetchedAt: cached.fetchedAt, items: cached.items };
    }
    return { source: "fallback", stale: false, fetchedAt: null, items: [] };
  }
}
