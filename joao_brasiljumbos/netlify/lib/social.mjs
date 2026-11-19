/**
 * Número de seguidores por rede, atualizado automaticamente.
 *
 *   APIs oficiais → função serverless → cache (Netlify Blobs) → cards do site
 *
 * Cada rede é independente: a que não estiver configurada (ou falhar)
 * simplesmente não entra na resposta, e o front-end mantém para ela o número
 * fixo de data/social-config.js. Uma rede que falhar depois de já ter
 * funcionado continua com o último valor válido do cache.
 *
 * Nenhum token chega ao navegador: a resposta contém só os números.
 *
 * VARIÁVEIS DE AMBIENTE (todas opcionais — cada rede liga quando a sua existir)
 *   Instagram  usa o mesmo INSTAGRAM_ACCESS_TOKEN dos vídeos (nada novo)
 *   YouTube    YOUTUBE_API_KEY        chave da YouTube Data API v3
 *              YOUTUBE_CHANNEL_ID     opcional; sem ele usa o @handle abaixo
 *   Facebook   FACEBOOK_PAGE_ID       id da Página Brasil Jumbos
 *              FACEBOOK_PAGE_TOKEN    token de acesso da Página (sem validade)
 *   TikTok     TIKTOK_CLIENT_KEY      app aprovado na TikTok (Display API,
 *              TIKTOK_CLIENT_SECRET   escopo user.info.stats) + refresh token
 *              TIKTOK_REFRESH_TOKEN   da conta @brasiljumbos
 */
import { getStore } from "@netlify/blobs";
import { currentToken } from "./instagram.mjs";

export const COUNTS_TTL_MS = 3 * 3600e3; // seguidores mudam devagar: 3 h basta
const FETCH_TIMEOUT_MS = 8000;
const YOUTUBE_HANDLE = "@BRASILJUMBOS";
const NETWORKS = ["instagram", "youtube", "facebook", "tiktok"];

/* --------------------------------------------------------------------------
   Armazenamento (mesmo padrão de instagram.mjs: Blobs com fallback em memória)
   -------------------------------------------------------------------------- */
const memory = new Map();

function store() {
  try {
    return getStore("social");
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
      console.warn(`[social] leitura do blob "${key}" falhou:`, err.message);
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
    console.warn(`[social] gravação do blob "${key}" falhou:`, err.message);
  }
}

async function fetchJSON(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    const apiError = body.error && (body.error.message || (body.error.code !== "ok" && body.error.code));
    if (!res.ok || apiError) throw new Error(apiError || `HTTP ${res.status}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

const env = (name) => (process.env[name] || "").trim();

/** Só aceita inteiros positivos — qualquer outra coisa é tratada como falha. */
function asCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`valor inválido: ${value}`);
  return Math.round(n);
}

/* --------------------------------------------------------------------------
   Uma função por rede. Devolve o número ou null (rede não configurada);
   lança erro se estiver configurada e falhar.
   -------------------------------------------------------------------------- */
async function instagram() {
  const current = await currentToken();
  if (!current) return null;
  const version = env("INSTAGRAM_GRAPH_VERSION");
  const user = env("INSTAGRAM_USER_ID") || "me";
  const base = version ? `https://graph.instagram.com/${version}` : "https://graph.instagram.com";
  const json = await fetchJSON(
    `${base}/${encodeURIComponent(user)}?fields=followers_count&access_token=${encodeURIComponent(current.token)}`
  );
  return asCount(json.followers_count);
}

async function youtube() {
  const key = env("YOUTUBE_API_KEY");
  if (!key) return null;
  const channel = env("YOUTUBE_CHANNEL_ID");
  const who = channel ? `id=${encodeURIComponent(channel)}` : `forHandle=${encodeURIComponent(YOUTUBE_HANDLE)}`;
  const json = await fetchJSON(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&${who}&key=${encodeURIComponent(key)}`
  );
  const stats = json.items && json.items[0] && json.items[0].statistics;
  if (!stats || stats.hiddenSubscriberCount) throw new Error("canal sem contagem pública de inscritos");
  return asCount(stats.subscriberCount);
}

async function facebook() {
  const page = env("FACEBOOK_PAGE_ID");
  const token = env("FACEBOOK_PAGE_TOKEN");
  if (!page || !token) return null;
  const json = await fetchJSON(
    `https://graph.facebook.com/${encodeURIComponent(page)}?fields=followers_count,fan_count&access_token=${encodeURIComponent(token)}`
  );
  return asCount(json.followers_count || json.fan_count);
}

/**
 * TikTok: o access token dura 24 h; o refresh token, 365 dias, e pode ser
 * trocado pela TikTok a cada renovação — o mais novo fica guardado no Blobs.
 * Se a variável de ambiente mudar, ela volta a valer (mesma lógica do token
 * do Instagram).
 */
async function tiktok() {
  const clientKey = env("TIKTOK_CLIENT_KEY");
  const clientSecret = env("TIKTOK_CLIENT_SECRET");
  const envRefresh = env("TIKTOK_REFRESH_TOKEN");
  if (!clientKey || !clientSecret || !envRefresh) return null;

  const saved = await readJSON("tiktok-token");
  const refreshToken = saved && saved.seed === envRefresh ? saved.refreshToken : envRefresh;

  const token = await fetchJSON("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!token.access_token) throw new Error("renovação do token do TikTok sem access_token");
  if (token.refresh_token) {
    await writeJSON("tiktok-token", { seed: envRefresh, refreshToken: token.refresh_token });
  }

  const json = await fetchJSON("https://open.tiktokapis.com/v2/user/info/?fields=follower_count", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  return asCount(json.data && json.data.user && json.data.user.follower_count);
}

const SOURCES = { instagram, youtube, facebook, tiktok };

/** Redes com credencial presente agora (sem chamar API nenhuma). */
function configuredNetworks() {
  const has = {
    instagram: env("INSTAGRAM_ACCESS_TOKEN"),
    youtube: env("YOUTUBE_API_KEY"),
    facebook: env("FACEBOOK_PAGE_ID") && env("FACEBOOK_PAGE_TOKEN"),
    tiktok: env("TIKTOK_CLIENT_KEY") && env("TIKTOK_CLIENT_SECRET") && env("TIKTOK_REFRESH_TOKEN"),
  };
  return NETWORKS.filter((n) => has[n]).join(",");
}

/**
 * Resposta: { fetchedAt, counts: { instagram?, youtube?, facebook?, tiktok? } }
 * Só aparecem as redes com número real (da API agora ou do último cache).
 *
 * O cache só vale enquanto o conjunto de redes configuradas for o mesmo de
 * quando ele foi gravado: ao adicionar uma credencial nova (ex.: a chave do
 * YouTube) o número aparece no próximo acesso, sem esperar as 3 h.
 */
export async function getCounts({ force = false } = {}) {
  const cached = await readJSON("counts");
  const configured = configuredNetworks();
  const fresh = cached && cached.configured === configured && Date.now() - cached.fetchedAt < COUNTS_TTL_MS;
  if (!force && fresh) return cached;

  const previous = (cached && cached.counts) || {};
  const counts = {};
  const results = await Promise.allSettled(NETWORKS.map((n) => SOURCES[n]()));

  results.forEach((result, i) => {
    const network = NETWORKS[i];
    if (result.status === "fulfilled" && result.value) {
      counts[network] = result.value;
    } else {
      if (result.status === "rejected") {
        console.warn(`[social] ${network} falhou:`, result.reason && result.reason.message);
      }
      if (previous[network]) counts[network] = previous[network]; // último valor válido
    }
  });

  const record = { fetchedAt: Date.now(), configured, counts };
  await writeJSON("counts", record);
  return record;
}
