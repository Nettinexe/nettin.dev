/**
 * Fotos reais do João ao longo da página (além da Hero e de "Quem é João?").
 *
 * Cada chave corresponde a um espaço já desenhado no index.html
 * ([data-photo-slot="..."]). Enquanto `src` estiver vazio, o espaço NÃO é
 * exibido e nenhuma requisição é feita — nada de placeholder nem de foto
 * gerada por IA. Assim que o arquivo real for salvo em assets/images/ e o
 * caminho preenchido aqui, a foto aparece sozinha.
 *
 *   src      caminho do arquivo (WebP, ~1600px de largura)
 *   alt      descrição real da cena
 *   caption  legenda curta (opcional)
 *   width    dimensões reais do arquivo (reservam o espaço, evitam CLS)
 *   height
 */
window.BRASIL_JUMBOS_PHOTOS = {
  /* Timeline › HOJE — João na rotina: aquário, alimentação, manutenção. */
  rotina: {
    src: "",
    alt: "",
    caption: "",
    width: 1600,
    height: 1067,
  },

  /* "O Brasil Jumbos acontece todos os dias" — manejo, pesca ou bastidores. */
  manejo: {
    src: "",
    alt: "",
    caption: "",
    width: 1600,
    height: 1067,
  },
};
