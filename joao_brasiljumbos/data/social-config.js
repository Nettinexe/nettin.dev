/**
 * Números de seguidores por rede social, exibidos na seção "Acompanhe o Brasil Jumbos".
 *
 * Estes são os números FIXOS de reserva. No ar (Netlify), o site busca
 * /api/social-counts e troca automaticamente cada rede que tiver API
 * configurada (ver README › "Seguidores em tempo real"). Este arquivo só
 * aparece para as redes sem automação, ou se a API estiver fora do ar.
 *
 * Enquanto o valor estiver como null, o número correspondente NÃO é exibido
 * no site — nenhuma métrica é inventada.
 */
window.BRASIL_JUMBOS_SOCIAL_COUNTS = {
  instagram: 1000000,
  youtube: 629000,
  facebook: 556000,
  tiktok: 766000,
};
