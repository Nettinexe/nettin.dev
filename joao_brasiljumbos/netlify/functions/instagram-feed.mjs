/**
 * GET /api/instagram-feed
 *
 * Endpoint público consumido pela seção "Últimos vídeos". Devolve só dados
 * já normalizados e seguros para o navegador — nunca o token.
 *
 * Resposta:
 *   {
 *     source: "api" | "cache" | "fallback",
 *     stale: boolean,          // true = API falhou e este é o último cache
 *     fetchedAt: number|null,
 *     items: [{ id, type, url, thumbnail, title, timestamp }]
 *   }
 *
 * items vazio → o front-end usa o fallback estático (data/latest-videos.js).
 */
import { getFeed, CACHE_TTL_MS } from "../lib/instagram.mjs";

export default async () => {
  const feed = await getFeed();
  const ok = feed.items.length > 0;
  const ttl = Math.round(CACHE_TTL_MS / 1000);

  return Response.json(feed, {
    headers: {
      /* Navegador: cache curto. CDN da Netlify: o mesmo TTL do cache de dados,
         servindo a versão anterior enquanto revalida em segundo plano. Sem
         dados, a CDN guarda só 1 min para a automação entrar logo que o
         token for configurado. */
      "Cache-Control": "public, max-age=300",
      "Netlify-CDN-Cache-Control": ok
        ? `public, durable, max-age=${ttl}, stale-while-revalidate=86400`
        : "public, max-age=60",
    },
  });
};

export const config = {
  path: "/api/instagram-feed",
};
