/**
 * ÚLTIMOS VÍDEOS — FALLBACK ESTÁTICO.
 *
 * A seção é alimentada automaticamente por /api/instagram-feed (Instagram →
 * API oficial da Meta → função serverless → cache). Esta lista só é usada
 * quando a API não responde E não existe nenhum cache — por exemplo, antes
 * de o token ser configurado ou ao abrir o site localmente sem a Netlify.
 * Mantenha aqui CINCO vídeos reais: é o que o visitante vê no pior caso.
 *
 * ---------------------------------------------------------------------------
 * COMO CONFIGURAR
 * ---------------------------------------------------------------------------
 * A lista tem SEMPRE cinco itens, em ordem cronológica (mais recente
 * primeiro). Eles aparecem lado a lado, da esquerda para a direita:
 *
 *   [0]  vídeo mais recente      ->  card 1 (esquerda)
 *   [1]  segundo mais recente    ->  card 2
 *   [2]  terceiro                ->  card 3
 *   [3]  quarto                  ->  card 4
 *   [4]  quinto                  ->  card 5 (direita)
 *
 * Nenhum card tem tratamento especial: para trocar a ordem, basta
 * reordenar os objetos aqui — o script cuida do resto.
 *
 * ---------------------------------------------------------------------------
 * CAMPOS
 * ---------------------------------------------------------------------------
 * thumbnail  Caminho da imagem. Use WebP e salve em assets/videos/.
 *            Enquanto o arquivo não existir, deixe como está: o card é
 *            renderizado sem imagem, sem quebrar o layout.
 *
 * url        Link do vídeo na plataforma original (Instagram, YouTube,
 *            TikTok…). ENQUANTO ESTIVER VAZIO o card aparece, mas NÃO é
 *            clicável — não é gerado href="#" nem link morto. Assim que
 *            você colar o link real, ele vira link automaticamente.
 *
 * title      OPCIONAL. Só preencha se for o título real do vídeo. Vazio =
 *            nenhum texto é exibido sobre a thumbnail (nada de placeholder).
 *
 * width      Dimensões REAIS do arquivo de thumbnail, em pixels. Servem para
 * height     o navegador reservar o espaço certo antes da imagem carregar
 *            (evita o layout "pular"). O padrão 1080×1920 é o de um vídeo
 *            vertical 9:16 — ajuste se a sua thumbnail tiver outra proporção.
 *            No desktop o card é 9:16 e a imagem preenche o card com
 *            object-fit: cover (sem distorcer) — prepare as thumbnails em
 *            9:16 para não haver recorte.
 */
window.BRASIL_JUMBOS_LATEST_VIDEOS = [
  {
    /* 1 — mais recente */
    thumbnail: "assets/images/tumbMulherpegaCascudogigantenaamazônia.webp",
    url: "https://www.instagram.com/reel/DdZh1lSp_Du/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Mulher pega Cascudo gigante na amazônia!!",
    width: 1080,
    height: 1920,
  },
  {
    /* 2 */
    thumbnail: "assets/images/tumbCascudosecovoltaavidadeformamilagrosa.webp",
    url: "https://www.instagram.com/reel/DdZl8gtpWU2/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Cascudo seco volta a vida de forma milagrosa?",
    width: 1080,
    height: 1920,
  },
  {
    /* 3 */
    thumbnail: "assets/images/tumbPorqueaLulamudadecorquandoabatida.webp",
    url: "https://www.instagram.com/reel/DdM0LygJ-Sf/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
    title: "Por que a Lula muda de cor quando abatida?",
    width: 1080,
    height: 1920,
  },
  {
    /* 4 — PREENCHER: thumbnail WebP 9:16 + link do Reel */
    thumbnail: "",
    url: "",
    title: "",
    width: 1080,
    height: 1920,
  },
  {
    /* 5 — PREENCHER: thumbnail WebP 9:16 + link do Reel */
    thumbnail: "",
    url: "",
    title: "",
    width: 1080,
    height: 1920,
  },
];
