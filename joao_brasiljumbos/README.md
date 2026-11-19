# Brasil Jumbos — site institucional

Site institucional (não comercial) do Brasil Jumbos, criado por João Teixeira.
HTML, CSS e JavaScript puros — sem framework, sem build step.

## Como executar localmente

Não há processo de build. Basta servir a pasta com qualquer servidor estático
(abrir `index.html` direto no navegador também funciona, exceto para o feed
automático do Instagram, que depende de uma função serverless).

```bash
# qualquer um destes funciona
python -m http.server 8080
npx serve .
```

Depois acesse `http://localhost:8080`.

## Estrutura

```
joao_brasiljumbos/
  index.html
  styles.css
  script.js
  netlify.toml          publish ".", funções em netlify/functions
  package.json          dependência das funções (@netlify/blobs)
  .env.example          variáveis do Instagram (modelo — nunca versionar o .env)
  assets/
    images/
      logo-brasil-jumbos-branco.png  logotipo oficial branco, fundo transparente
      foto1.webp            João (real) — Hero
      foto2.webp            João (real) — "Quem é João?"
      raia-potamotrygon.webp  "Um novo olhar para os peixes de rio"
      timeline-2012.webp … timeline-hoje.webp  fotos reais enviadas pelo João,
                            uma por marco da linha do tempo
      timeline-2020-recorte.webp  João + pirarara com fundo removido (alfa)
      pirarara.webp         (não usado no momento)
      tucunare.webp         pilar 03 "O que é aquarismo jumbo?"
      pirarucu.webp         fundo de "O que você encontra"
      tumb*.webp            thumbnails do fallback estático de vídeos
      og-brasil-jumbos.jpg  preview social (og:image / twitter:image)
      favicon-*.png         peixe do logotipo, branco sobre preto
      icone.svg             logo ANTIGO (JPEG embrulhado em SVG) — não usado
  data/
    latest-videos.js    fallback estático de "Últimos vídeos"
    site-photos.js      fotos reais do João nos espaços opcionais
    social-config.js    números de seguidores por rede (null = não exibe)
  netlify/
    lib/instagram.mjs           núcleo: API, cache, token, normalização
    lib/social.mjs              seguidores por rede (Instagram/YouTube/Facebook/TikTok)
    functions/
      instagram-feed.mjs        GET /api/instagram-feed
      social-counts.mjs         GET /api/social-counts
      instagram-refresh.mjs     rotina agendada (@hourly): token, feed e seguidores
```

## Direção de imagem (rodada de refinamento pós-aprovação)

Regra do cliente: **João real = sempre foto real fornecida por ele** (nunca
IA); **peixes = fotos reais de espécies do universo Brasil Jumbos**. Cada
imagem tem função narrativa — o site não é galeria.

| Onde | Imagem | Por quê |
|---|---|---|
| Hero | `foto1.webp` (João, recorte transparente) | rosto real do projeto |
| 02 · Quem é João? | `foto2.webp` (João, camisa de pesca) | apresenta a pessoa |
| 03 · Aquarismo jumbo | tucunaré (legenda *Cichla* sp., só o gênero — pedido do João) | o que é um peixe jumbo de rio |
| Timeline 2012 | `timeline-2012.webp` aquário com tucunarés | foto real enviada pelo João |
| Timeline 2015 | `timeline-2015.webp` João pescando | foto real enviada pelo João |
| Timeline 2016 | `timeline-2016.webp` grupo com camisetas Brasil Jumbos | foto real enviada pelo João |
| Timeline 2020 | `timeline-2020-recorte.webp` João com pirarara albina (fundo removido) | foto real enviada pelo João; `timeline-2020.webp` (foto inteira) fica como reserva, não é usada |
| Timeline HOJE | `timeline-hoje.webp` João no aquário do poraquê | foto real enviada pelo João |
| Um novo olhar | raia de água doce | a "nova perspectiva" sobre peixes de rio |
| O que você encontra | pirarucu, ao fundo | identidade de nicho sem disputar com a lista |
| Acontece todos os dias | **espaço opcional** `manejo` | manejo/bastidores (aguarda foto) |

### Fotos de espécies e licenças

As quatro fotos de peixes vêm do **Wikimedia Commons** (três CC BY 2.0, uma
domínio público). CC BY **exige atribuição**: os créditos estão no rodapé
(`.site-footer__credits`) e não podem ser removidos enquanto as imagens
estiverem no site. Se o João enviar fotos dos peixes dele, basta substituir
os arquivos (mesmo nome) e retirar o crédito correspondente — o ideal é que,
com o tempo, as espécies mostradas sejam as dos aquários dele.

### Fotos da linha do tempo — um tratamento por marco

As cinco fotos foram enviadas pelo João (WhatsApp), na ordem dos marcos.
Elas **não** seguem um padrão único "texto → retângulo": cada uma tem uma
função narrativa e um tratamento (`.tl-photo--*` em `styles.css`). Cada
figura é filha direta do grid do marco — no desktop ocupa colunas
próprias; no mobile cai abaixo do texto.

| Marco | Tratamento | Desktop | Mobile |
|---|---|---|---|
| 2012 | **registro** — pequeno, sem borda, fade lateral e na base, levemente dessaturado | texto col. 5–9 · foto col. 10–12 (máx. 300px) | pequena (58%, máx. 250px) |
| 2015 | **faixa** — horizontal, nasce sob o "JF → MG" e atravessa o grid até a borda | col. 4 → borda, proporção 2.6:1, máx. 400px de altura | **oculta** |
| 2016 | **arquivo** — passe-partout escuro, linha 1px, legenda "2016 · Brasil Jumbos" | ao lado de BRASIL / JUMBOS., col. 9–12 (máx. 320px) | contida (78%, máx. 330px) |
| 2020 | **recorte** — João + pirarara sem fundo, flutuando no preto, glow vermelho mínimo | texto col. 5–7 · recorte col. 8 → borda (máx. 620px) | largura cheia (máx. 440px) |
| HOJE | **documental** — secundária, fade em todas as bordas | col. 9–12 (máx. 380px) | **oculta** |

- **Recorte de 2020** (`timeline-2020-recorte.webp`, 786×720, com alfa):
  fundo removido com `rembg` (modelo `isnet-general-use`) a partir da foto
  original, sem nenhuma alteração da pessoa ou do peixe — rosto, mãos,
  cauda, barbatanas e barbilhões preservados. A base tem fade porque a
  foto original cortava as pernas.
- **2015** já vem cortada em 1280×545 (João, vara e rio inteiros).
- **Mobile**: 2015 e HOJE não aparecem, para encurtar a página e deixar
  2012 / 2016 / 2020 como os registros visuais. Texto e data continuam.
  Essas duas usam `<picture>` com um `<source media="(max-width: 767px)">`
  apontando para um GIF de 1px em data URI, então o arquivo **não é
  baixado** no celular (só `display:none` não bastaria).
- **Reveal**: faixa entra da direita (40px), recorte da direita com
  `scale(.96 → 1)`, registro e arquivo revelam por uma "cortina" preta
  (`::after`) que recolhe. Nunca usar `clip-path` na figura: um ancestral
  100% recortado faz a `<img loading="lazy">` nunca ser baixada.
- Os JPEGs originais do WhatsApp continuam em `assets/images/` e podem ser
  apagados.

### Espaço opcional para foto do João

Ainda falta uma foto dele no manejo/bastidores. O espaço já está desenhado
no HTML (`[data-photo-slot="manejo"]`) e fica
**ocultos** até serem configurados em `data/site-photos.js` — sem
placeholder, sem requisição, sem foto inventada. Para ativar: salvar o
arquivo em `assets/images/` e preencher `src`, `alt`, `caption`, `width` e
`height`. Se o arquivo falhar ao carregar, o espaço volta a ficar oculto.

### Timeline: branco e vermelho

Os anos alternam cor sólida: **2012 vermelho · 2015 branco · 2016 vermelho
· 2020 branco · HOJE vermelho**. 2020 em branco é pedido explícito do
cliente e está fixado no HTML (`.timeline-item__year--white`), não em
`:nth-child` — reordenar ou inserir marcos não muda a cor dele. O título de
2020 passou de "MILHÕES DE VISUALIZAÇÕES." para **"A GRANDE VIRADA."**
(narrativa em vez de métrica); o texto de apoio continua citando os milhões
de visualizações.

### Logotipo

`logo-brasil-jumbos-branco.png` é a versão branca oficial com
**transparência real** (alpha gerado a partir da luminância do arquivo
original), usada no header e no footer. O `icone.svg` antigo era um JPEG
branco-sobre-preto embrulhado num SVG com um `<rect>` branco por trás —
fundo chapado — e não é mais referenciado.

## Como substituir a fotografia da Hero

A Hero usa `assets/images/foto1.webp` (1536×1024, recorte com fundo
transparente). Para trocar, atualize no `index.html`:

1. o `<link rel="preload">` no `<head>`;
2. o `src` + `width`/`height` do `<img>` em `.hero__media`.

Mantenha `fetchpriority="high"` e **sem** `loading="lazy"` (é o LCP). Um
recorte transparente funciona melhor: o preto e o brilho vermelho da Hero
aparecem por trás. No desktop a foto começa abaixo do header
(`inset: var(--header-height) …`) para o cabelo nunca ficar sob a
navegação; ajuste só `object-position` se o enquadramento novo pedir.

## Números de impacto (raia)

Fixos no HTML, atualizados a pedido do João (nov/2026): **+3 milhões** de
seguidores somando todas as redes e **+500 milhões** de visualizações.
Ficam em `.ray__value` (`data-target` + texto) — mude os dois juntos.

## Seguidores em tempo real

```
APIs oficiais → /api/social-counts (lib/social.mjs) → cache 3 h → cards "Acompanhe"
```

O front-end pinta na hora os números fixos de `data/social-config.js` e,
logo depois, troca cada rede que a API devolver. Cada rede liga sozinha
quando as suas variáveis de ambiente existirem; a que não estiver
configurada (ou falhar) fica com o número fixo. Se uma API falhar depois de
já ter funcionado, vale o último número do cache. O YouTube aparece como
"inscritos"; as demais, "seguidores".

| Rede | O que configurar na Netlify | Observação |
|---|---|---|
| Instagram | nada novo — usa `INSTAGRAM_ACCESS_TOKEN` | campo `followers_count` |
| YouTube | `YOUTUBE_API_KEY` (e opcional `YOUTUBE_CHANNEL_ID`) | API key grátis no Google Cloud; a API arredonda para 3 dígitos significativos |
| Facebook | `FACEBOOK_PAGE_ID` + `FACEBOOK_PAGE_TOKEN` | token de Página gerado a partir de um token de usuário de longa duração não expira |
| TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` | exige app na TikTok com escopo `user.info.stats` (revisão da TikTok); o refresh token renovado fica no Blobs |

Para conferir: abra `/api/social-counts` no site publicado.

## Números fixos de reserva

Edite `data/social-config.js`. Enquanto um valor estiver `null`, o número
correspondente não aparece no site — nenhuma métrica é inventada.

```js
window.BRASIL_JUMBOS_SOCIAL_COUNTS = {
  instagram: 850000,
  youtube: null,
  facebook: null,
  tiktok: null,
};
```

## ÚLTIMOS VÍDEOS — 5 cards lado a lado

> Os dados vêm da automação do Instagram (ver "Automação do Instagram").
> O `data/latest-videos.js` descrito abaixo é o **fallback estático**.

A seção mostra **cinco vídeos lado a lado**, todos com o mesmo peso visual:
pôsteres verticais 9:16, retos, com borda vermelha arredondada. Não há card
principal, rotação nem sobreposição (o antigo deck de três cartas em leque
foi descartado pelo cliente).

### Como configurar o fallback

O fallback vive em `data/latest-videos.js`. A lista tem **sempre cinco itens**,
em ordem cronológica — mais recente primeiro, da esquerda para a direita:

| posição na lista | card |
|---|---|
| `[0]` | 1 — mais recente (esquerda) |
| `[1]` | 2 |
| `[2]` | 3 |
| `[3]` | 4 |
| `[4]` | 5 (direita) |

```js
window.BRASIL_JUMBOS_LATEST_VIDEOS = [
  { thumbnail: "assets/videos/video-01.webp", url: "", title: "",
    width: 1080, height: 1920 },   // card 1 — mais recente
  // ... até 5
];
```

As thumbnails vão em `assets/videos/` (veja o `LEIA-ME.txt` de lá).

### Estados enquanto falta configuração

A fileira foi feita para nunca quebrar durante a montagem:

- **`url` vazia** → o card é renderizado como `<div>`, não como link. Não é
  gerado `href="#"` nem link morto. Assim que a URL real entra, ele vira `<a>`
  sozinho. Card sem link não recebe hover.
- **thumbnail ausente ou com 404** → o card cai num estado sem imagem
  mantendo a proporção, em vez de exibir ícone de imagem quebrada.
- **`title` vazio** → nenhum texto é exibido. Não existe placeholder textual.

### Sem player, só thumbnail

Nada de `<iframe>`, `<video>` ou embed de plataforma: o clique abre o vídeo
na origem (`target="_blank"` + `rel="noopener noreferrer"`). As imagens usam
`loading="lazy"`, `decoding="async"` e `width`/`height` reais — a seção está
abaixo da dobra e **não** deve ser pré-carregada; só a Hero tem prioridade.

No desktop o pôster é `aspect-ratio: 9 / 16` e a imagem usa
`object-fit: cover` — todos os cards ficam com a mesma altura. Prepare as
thumbnails em 9:16 para não haver recorte.

### Layout e interação

- **≥ 1200px:** grid `repeat(5, minmax(0, 1fr))`, os cinco visíveis, sem
  scroll. A partir de 1600px a fileira se alarga até 1560px (o título segue
  no container padrão).
- **1024–1199px:** os cards mantêm no mínimo 196px e a fileira rola na
  horizontal (scroll-snap), em vez de esmagar os vídeos.
- **< 1024px:** carrossel com scroll-snap (84vw até 340px), agora com 5 cards.
- **Hover / `:focus-visible`:** só o card apontado sobe 10px, cresce 3% e
  ganha borda/sombra mais intensas (`z-index: 2`, apenas para a sombra não
  ser cortada). Os outros quatro não mudam nada.
- O reveal fica no container (`.video-deck`), nunca nos cards: ele termina em
  `transform: none` e anularia o hover.
- Toda a interação é CSS; o JS apenas monta o DOM.
- Em `prefers-reduced-motion`, nada se desloca: o destaque vem só de borda e
  sombra.

## Automação do Instagram (aprovada pelo cliente)

```
Instagram → API oficial da Meta → função serverless → cache → "Últimos vídeos"
```

- **API:** Instagram API with Instagram Login (`graph.instagram.com`). A
  Basic Display API foi descontinuada e **não** é usada.
- **Endpoint:** `GET /api/instagram-feed` (`netlify/functions/instagram-feed.mjs`).
  Devolve só dados normalizados — `url` do post, `thumbnail`, `title`
  (1ª linha da legenda) — nunca o token.
- **Seleção:** os **cinco** vídeos/Reels mais recentes, em ordem cronológica
  (mais recente primeiro); se houver menos de cinco, completa com as
  publicações mais recentes. Um cache gravado na época dos 3 cards é
  rebuscado automaticamente (o registro guarda o `limit`).
- **Reels/vídeos:** só a `thumbnail_url` + link para o post original.
  Nenhum player, iframe ou `<video>`.
- **Cache:** 45 min (faixa pedida: 30–60), guardado no Netlify Blobs —
  sobrevive a cold starts. Na CDN, o mesmo TTL com
  `stale-while-revalidate`.
- **Rotina agendada** (`instagram-refresh.mjs`, `@hourly`): atualiza o
  cache (as URLs de thumbnail da Meta expiram, então ficam sempre frescas)
  e **renova o token de longa duração a cada ~5 dias** (cada renovação dá
  mais 60 dias). O token renovado fica no Blobs, privado ao site.

### Cascata de fallback

1. cache com menos de 45 min → responde do cache;
2. senão, API oficial → grava cache e responde;
3. API falhou → **último cache**, de qualquer idade (`stale: true`);
4. sem cache → `items: []` e o front-end usa o **fallback estático**
   `data/latest-videos.js`.

O front-end também cai no fallback estático se o endpoint não responder em
4,5s ou se o site for aberto localmente (sem Netlify). A seção nunca fica
vazia nem mostra conteúdo inventado.

### Como ativar

1. A conta @brasiljumbos precisa ser **profissional** (Criador ou Empresa).
2. Em Meta for Developers: criar um app, adicionar o produto
   **Instagram → API setup with Instagram login**, conectar a conta e gerar
   um **token de longa duração** com a permissão `instagram_business_basic`.
3. Na Netlify (Site configuration → Environment variables):
   - `INSTAGRAM_ACCESS_TOKEN` (obrigatória)
   - `INSTAGRAM_USER_ID` (opcional; sem ela usa `/me`)
   - `INSTAGRAM_GRAPH_VERSION` (opcional, ex.: `v23.0`)
4. Redeploy. Para conferir, abra `/api/instagram-feed`: `source: "api"`
   indica que a automação está no ar.

Se o token for revogado, basta gerar outro e trocar a variável: a função
detecta que ela mudou e passa a usar o novo valor.

## Como ativar os depoimentos

A seção `#depoimentos` existe no HTML mas fica `hidden` por padrão — nenhum
depoimento foi fornecido para publicação. Para ativar: preencha
`data-testimonials-list` em `index.html` (ou adapte para carregar de um
array em JS, seguindo o mesmo padrão de `data/site-photos.js`) com depoimentos
reais e remova o atributo `hidden` da `<section id="depoimentos">`.

## Deploy (Netlify)

1. Conecte o repositório (ou arraste a pasta em app.netlify.com/drop para um
   teste rápido).
2. Build command: nenhum. Publish directory: `joao_brasiljumbos` (ou a raiz,
   dependendo de como o repositório for organizado).
3. Configure as variáveis de ambiente do Instagram (seção acima). A
   Netlify instala `@netlify/blobs` a partir do `package.json` sozinha.
4. Aponte o domínio `www.brasiljumbos.com.br` nas configurações de domínio
   da Netlify.

## Engenharia de layout: por que não há mais sticky/scrollytelling

Uma segunda rodada de direção de arte havia introduzido dois mecanismos de
scrollytelling: um "palco" `position:sticky` com crossfade para os 3 blocos
de "Três Respostas" (~300vh de percurso) e uma trilha horizontal sticky
para a timeline (a altura do wrapper era calculada em JS a partir da
largura da trilha, chegando a ~4x a altura da viewport). Uma terceira
rodada, focada em estabilidade estrutural, **removeu os dois por completo**
— o ganho visual não compensava a fragilidade: alturas artificiais gigantes,
o "buraco" preto depois de "HOJE" (o próprio spacer de ~4 telas de altura),
e um bug real de `position:sticky` (veja abaixo) que passou despercebido em
duas rodadas de revisão visual.

Hoje:

- **Três Respostas** (`.pillar`) são três blocos editoriais empilhados,
  `display:grid` por bloco (`número | conteúdo | mídia` a partir de
  1024px), altura 100% definida pelo conteúdo via `padding-block: clamp(...)`.
  Sem JS nenhum controlando a geometria.
- **Timeline** (`.timeline-list`) é uma lista vertical real — cada
  `.timeline-item` é uma row do documento, também `display:grid`
  (`ano | conteúdo`, e `ano | conteúdo | foto` para 2020/HOJE). Os anos
  gigantes (`.timeline-item__year`, contorno/outline) ocupam espaço real no
  grid; só a palavra-fantasma "BRASIL" atrás do título de 2016 é
  decorativa (`position:absolute`, contida com `overflow:clip` no próprio
  item, nunca pode vazar para fora dele).
- `script.js` não tem mais `initStage`/`initTimeline` — a geometria dessas
  duas seções é 100% CSS, então funciona igual com JavaScript desativado e
  sobrevive a qualquer resize sem recálculo.

**A armadilha de CSS que causou tudo isso, para não reintroduzir:**
`overflow-x: hidden` no `<html>` ou no `<body>` quebra `position: sticky`
em **toda** a página, silenciosamente — o navegador aplica
`overflow-y: auto` por baixo dos panos (regra da spec para eixos "hidden" +
"visible" combinados), o que faz o `body` virar seu próprio scroll
container e desalinha a lógica de sticky do scroll real da janela. Os
elementos continuam com `getComputedStyle().position === "sticky"` (parece
certo!), mas deslizam junto com o resto da página — e o efeito quebrado
ainda pode parecer certo em capturas de tela isoladas, porque o conteúdo
continua passando pela viewport, só que sem "prender". `html`/`body` usam
`overflow-x: clip` (não `hidden`) por causa disso, e ainda é necessário
hoje: o sangramento decorativo das fotos (Hero, peixe do painel 03) depende
dele. Se `position:sticky` for reintroduzido no futuro, valide sempre com
`elemento.getBoundingClientRect().top` no meio do scroll — nunca só
visualmente.

## Grid de 12 colunas e escala de espaçamento

As seções principais usam `.grid-12` (12 colunas, `column-gap` fluido) a
partir de 1024px; abaixo disso vira uma coluna só. As faixas de colunas
ficam declaradas no CSS de cada seção, não em classes utilitárias soltas:

| Seção            | Colunas                                      |
|------------------|----------------------------------------------|
| Três Respostas   | número 1–2 · headline 3–6 · copy 7–12        |
| Timeline         | ano 1–4 · conteúdo 5–12                      |
| Um novo olhar    | headline 1–8 · copy 9–12                     |
| O que você encontra | headline 1–5 · lista 7–12                 |
| Redes sociais    | Instagram span 6 · demais span 2 cada        |

Espaçamento vem só de tokens (`--space-xs/sm/md/lg/xl`, `--section-space`,
`--chapter-gap`) — nada de `margin-top: 300px` avulso. `--chapter-gap`
(96–160px) é o respiro entre capítulos; só a Hero usa `min-height:100svh`.

A headline da Hero usa `clamp(2.2rem, min(7.5vw, 6.8vh), 3.6rem)`: o termo
em `vh` faz as 5 linhas + copy + CTA caberem inteiras em telas baixas
(1280×720, 1366×768) sem nenhum valor fixo chutado por resolução.

## Métrica real da Anton e a entrelinha dos títulos

A fonte display é **Anton**. Os acentos dela são desenhados bem acima da
caixa alta, e era daí que vinha o problema de títulos "colados". Medindo a
fonte no navegador (canvas, `actualBoundingBox`), em unidades `em`:

| referência | altura acima da baseline |
|---|---|
| caixa alta sem acento (`H`, `O`) | **0.875** |
| acento agudo/circunflexo (`É` `Ê` `Á` `Í`) | **1.109** |
| til (`Ã` `Õ`) | **1.078** |
| cauda do `Q` / cedilha do `Ç` | até **0.313** *abaixo* |

O acento ocupa sozinho a faixa **0.875 → 1.109 = 0.234em**. Com
`line-height` entre `.8` e `.96` essa faixa simplesmente não existia, e o
acento da linha de baixo era desenhado dentro do corpo da linha de cima.

Isso explica por que só **alguns** títulos pareciam quebrados: os
acentuados (`TRÊS`, `JOÃO?`, `AQUÁRIO`, `MILHÕES`, `É MAIOR`) colidiam, e
os sem acento (`UM NOVO OLHAR`, `ACONTECE`) nunca deram problema.

### Como os valores foram escolhidos

Não foram estimados. Para cada par de linhas de cada título real da página
foi calculado, **coluna de pixel por coluna de pixel**, o menor
`line-height` em que nenhuma tinta da linha de baixo invade a de cima:

| título | mínimo medido |
|---|---|
| `O PRIMEIRO / AQUÁRIO JUMBO.` | 1.097em ← maior exigência da página |
| `O MUNDO DOS PEIXES / É MAIOR…` (rodapé) | 1.093em |
| `QUEM É / JOÃO?` | 1.070em |
| `MILHÕES DE / VISUALIZAÇÕES.` | 1.070em |
| `O MUNDO DOS / PEIXES É` (Hero) | 1.060em |
| `O QUE VOCÊ / ENCONTRA NO` | 0.957em |
| `UM NOVO / OLHAR` | 0.877em |
| `BRASIL / JUMBOS.` | 0.703em |

Daí saem os três tokens em `:root`:

```css
--lh-display-xl:  1.08;  /* títulos grandes  — exigência máxima 1.070 */
--lh-display-md:  1.14;  /* títulos médios   — exigência máxima 1.097 */
--lh-display-flat: .92;  /* SÓ onde nenhuma linha leva acento */
```

`--lh-display-flat` é usado em exatamente dois lugares, e os dois são
seguros **por construção**, não por sorte: `BRASIL / JUMBOS.` (nome da
marca, sem um acento sequer) e os numerais de impacto (`+3`, `+500`).

> Se algum dia entrar um título novo com acento, ele deve usar
> `--lh-display-xl` ou `--lh-display-md` — nunca `--lh-display-flat`.

### Os wrappers `.hero__line` / `.new-look__line`

Os dois tinham `overflow:hidden`, resquício de um reveal em máscara que não
existe mais: hoje o `data-reveal` está **no próprio wrapper** (opacidade +
`translateY`), e o `<span>` interno não anima. O clip não servia a nenhuma
animação e cortava o topo do `É` da Hero. Foi removido — não compensado com
`padding`/`margin` negativo, simplesmente removido, porque não havia o que
preservar.

### Por que não há `text-wrap: balance`

Todos os títulos display quebram por `<br>` explícito no HTML (ou são de
uma linha só). `balance` seria CSS morto e, se algum dia as quebras saírem
do HTML, ele passaria a disputar com quebras que são decisão de design.

## Altura da Hero: `--hero-chrome`

A headline da Hero no desktop não usa um coeficiente `vh`. Um `vh` puro não
atende 720px e 768px ao mesmo tempo: o custo fixo da Hero (header, paddings,
eyebrow, parágrafo, assinatura, CTA e indicador de scroll) é o **mesmo** nos
dois, mas pesa muito mais numa tela de 720 — calibrar para caber em 720
desperdiça altura em 768, e vice-versa.

```css
--hero-chrome: 366px;   /* tudo que na Hero NÃO é a headline */

.hero__headline{
  font-size: clamp(2.2rem,
                   min(5.2vw, calc((100svh - var(--hero-chrome)) * .167)),
                   4.8rem);
}
```

O termo de altura mede a sobra real para a headline; `.167` divide essa
sobra pelas 5 linhas já multiplicadas pela entrelinha (5 × 1.08 = 5.4 ⇒
1/5.4 = .185) e guarda ~10% de folga. O teto de `5.2vw` é o que segura a
linha mais longa em ~40% da largura da Hero — é ele que impede o texto de
avançar sobre o João.

Resultado medido (fonte da headline, e se a Hero cabe em 100svh):

| viewport | antes | depois | ganho | Hero cabe |
|---|---|---|---|---|
| 1280×720  | 48.96px | 59.1px | +20.7% | sim (720/720) |
| 1366×768  | 52.22px | 67.1px | +28.6% | sim (768/768) |
| 1440×900  | 57.60px | 74.9px | +30.0% | sim (900/900) |
| 1536×864  | 57.60px | 76.8px | +33.3% | sim (864/864) |
| 1920×1080 | 57.60px | 76.8px | +33.3% | sim (1080/1080) |

1280×720 fica abaixo da faixa de 25–35% de propósito: é a tela mais baixa
testada e, com 5 linhas + entrelinha correta + parágrafo + CTA + indicador,
qualquer valor maior empurraria o indicador de scroll para fora da Hero.

Esta regra vive **dentro de `@media (min-width: 1024px)`**. Entre 768 e
1023px a Hero ainda é empilhada (texto em cima, foto embaixo), a headline
usa a largura inteira e continua com a escala já aprovada.

## Sistema de breakpoints

Um único sistema, usado em todo o CSS — sem valores ad-hoc como 720/860/900:

```
mobile   até 767px
tablet   768–1023px   (--bp-tablet)
laptop   1024–1279px  (--bp-laptop)
desktop  1280px+      (--bp-desktop)
```

A troca estrutural (pilha → grid) acontece **sempre em 1024px**, o mesmo
ponto em que o header troca para navegação desktop — header e conteúdo
nunca ficam em "estados" diferentes. Entre 768 e 1279px o layout já usa a
versão desktop/grid; o que muda nesse intervalo é só escala via `clamp()`,
não estrutura.

`--header-height` (64px mobile / 88px tablet+) é uma altura **fixa** do
header (`height` + `display:flex; align-items:center`, não
padding-e-conteúdo-automático) — a Hero soma essa mesma variável no seu
`padding-top`, então os dois nunca podem ficar dessincronizados por um
header mais alto do que o esperado.

### Hero mobile: uma composição só (headline + João lado a lado)

No mobile a Hero tem três zonas:

```
ZONA A   headline (esquerda)  |  João (direita)     <- o "palco"
ZONA B   texto de apoio + assinatura, largura cheia
ZONA C   CTAs + Instagram + indicador de scroll
```

Tudo gira em torno de **uma variável**:

```css
.hero{
  --hero-stage-h: clamp(300px, 84vw, 390px);
  --hero-stage-top: calc(var(--header-height) + 14px);
}
.hero__media   { position:absolute; top:var(--hero-stage-top);
                 right:-12px; width:44%; height:var(--hero-stage-h); }
.hero__headline{ max-width:78%; min-height:calc(var(--hero-stage-h) - 26px); }
```

`--hero-stage-h` vale para os **dois lados ao mesmo tempo**: é a altura da
caixa do João *e* o `min-height` da headline. É isso que garante que o
parágrafo sempre comece depois do palco, em qualquer largura, sem ajuste
por breakpoint — o João nunca cai atrás do texto corrido.

#### Por que a altura do palco controla o tamanho do João

A foto é 2730×1536 (paisagem) e a caixa dele é estreita e alta. Nessa
combinação o `object-fit: cover` escala **sempre pela altura** e recorta na
horizontal. Consequência prática:

- a **altura** do palco decide o tamanho da cabeça;
- a **largura** da caixa decide só quanto do corpo aparece.

Aumentar a largura não aumenta o João. Por isso a escala dele se ajusta por
`--hero-stage-h`, não por `width` nem por `transform: scale()`.

`object-position: 50% top` centra a janela no corpo dele (que ocupa de 31% a
70% do quadro): o recorte que sobra sai pela direita, onde a foto já sangra
12px para fora do container, e `top` garante que o cabelo nunca seja
cortado. As duas máscaras cruzadas (`mask-composite`) dissolvem a caixa
retangular — a da esquerda apaga a emenda contra a headline, a de baixo
evita que o corpo termine num corte reto sobre o parágrafo.

#### A largura da headline é uma restrição de quebra, não de composição

O design exige cinco linhas:

```
O MUNDO DOS / PEIXES É / MAIOR / DO QUE / PARECE.
```

Medido em Anton, **"O MUNDO DOS" sozinho precisa de ~70% da coluna**,
enquanto as outras quatro linhas ocupam de 33% a 45%. Por isso
`max-width: 78%`: não é a largura visual do bloco, é só o mínimo para a
primeira linha não quebrar em duas. Visualmente a headline continua
ocupando pouco mais de 40% — o João fica ao lado das linhas curtas.

Isso também explica o piso do `clamp`: entre 361 e 390px o antigo piso de
`3rem` era **maior** que o termo em `vw`, e "O MUNDO DOS" estourava a
coluna. Com o piso em `2.35rem` quem manda nessa faixa é o `vw`, que
acompanha a largura da coluna.

Verificado por pixel em 360, 390 e 430: escondendo o texto e medindo a
luminância do fundo exatamente sob a tinta de cada linha, o pior valor é
**21/255** — a headline está sempre sobre preto, nunca sobre o João.

### Entrelinha no mobile é MAIOR que no desktop

Parece contraintuitivo, mas segue da métrica da Anton (ver acima): a reserva
do acento é uma fração fixa do `em` (0.234em). Em telas pequenas os títulos
display caem para o piso do `clamp()`, e aí 1.08em de entrelinha vira só
~2.9px de folga entre o til do "JOÃO?" e a linha de cima — tecnicamente não
encosta, mas **lê como se encostasse**. Por isso o bloco `≤767px` sobe a
entrelinha dos títulos (1.12–1.22) em vez de baixá-la.

A exceção é `.timeline-item__title--giant` ("BRASIL / JUMBOS."), que não tem
um acento sequer e mantém `--lh-display-flat` para preservar a pilha cerrada.

### O bloco 431–767px foi removido

Existia um ajuste `@media (min-width: 431px) and (max-width: 767px)` que
empurrava a fotografia para baixo (`inset-block-start: 50%`) e congelava a
headline em `3.35rem`. Ele resolvia a Hero antiga, em que a foto era uma
camada de fundo atrás do texto.

Com o palco lado a lado esse bloco passou a **atrapalhar**: o
`inset-block-start: 50%` vencia o `top` do palco (vem depois no arquivo) e
jogava o João para o meio da tela em telas de 431px para cima — o que
quebrava a composição justamente em tablets. Foi removido.

## Progressive enhancement (a página funciona sem JavaScript)

Um script síncrono no `<head>` (`document.documentElement.classList.add('js')`)
adiciona a classe `.js` ao `<html>` antes da página pintar. Todo o sistema
de reveal-on-scroll (`[data-reveal]`, `[data-reveal-block]`,
`[data-reveal-scale]`) está escondido atrás do seletor `.js [data-reveal...]`
no CSS — sem JavaScript, `.js` nunca existe, essas regras de `opacity:0`
nem chegam a valer, e todo o conteúdo nasce visível. Teste isso desabilitando
JavaScript no navegador antes de mudar esse sistema: nenhum elemento pode
depender de script rodar para aparecer.

## Notas de performance/SEO já aplicadas

- Imagem da Hero (LCP) sem `loading="lazy"`, com `fetchpriority="high"` e
  `<link rel="preload">`.
- Todas as demais imagens abaixo da dobra usam `loading="lazy"` +
  `decoding="async"`.
- `<picture>` com `srcset`/`sizes` (webp com fallback jpg) em todas as fotos.
- Uma única webfont (Anton, peso 400, `font-display: swap`) só para
  headlines; o corpo do texto usa a pilha `system-ui`.
- `prefers-reduced-motion: reduce` remove parallax, contadores animados e o
  scroll horizontal da timeline, mostrando o conteúdo final imediatamente.
- JSON-LD (`Person`) com apenas informações confirmadas pelo cliente.
