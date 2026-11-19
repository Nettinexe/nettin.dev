/**
 * GET /api/social-counts
 *
 * Números de seguidores para os cards "Acompanhe o Brasil Jumbos".
 * Devolve só números — nunca tokens.
 *
 * Resposta:
 *   { fetchedAt: number, counts: { instagram?, youtube?, facebook?, tiktok? } }
 *
 * Rede ausente em `counts` → o front-end mantém o número fixo de
 * data/social-config.js para ela.
 */
import { getCounts, COUNTS_TTL_MS } from "../lib/social.mjs";

export default async () => {
  const data = await getCounts();
  const ok = Object.keys(data.counts).length > 0;
  const ttl = Math.round(COUNTS_TTL_MS / 1000);

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=600",
      "Netlify-CDN-Cache-Control": ok
        ? `public, durable, max-age=${ttl}, stale-while-revalidate=86400`
        : "public, max-age=60",
    },
  });
};

export const config = {
  path: "/api/social-counts",
};
