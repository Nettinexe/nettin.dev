/**
 * Rotina agendada (Netlify Scheduled Function) — roda a cada hora.
 *
 * 1. Renova o token de longa duração quando passou do intervalo
 *    (TOKEN_REFRESH_AFTER_MS, ~5 dias). Cada renovação dá mais 60 dias de
 *    validade, então o token nunca chega a vencer enquanto o site estiver no ar.
 * 2. Atualiza o cache do feed, para o visitante quase sempre receber uma
 *    resposta pronta — e para as URLs de thumbnail da Meta (que expiram)
 *    estarem sempre frescas.
 *
 * Falhas aqui nunca derrubam o site: o endpoint continua servindo o último
 * cache e, sem cache, o front-end usa o fallback estático.
 */
import { refreshTokenIfDue, getFeed } from "../lib/instagram.mjs";

export default async () => {
  try {
    const token = await refreshTokenIfDue();
    console.log("[instagram-refresh] token:", JSON.stringify(token));
  } catch (err) {
    console.error("[instagram-refresh] renovação do token falhou:", err.message);
  }

  const feed = await getFeed({ force: true });
  console.log(`[instagram-refresh] feed: source=${feed.source} stale=${feed.stale} items=${feed.items.length}`);
};

export const config = {
  schedule: "@hourly",
};
