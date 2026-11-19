/* Brasil Jumbos — script principal (vanilla JS, sem dependências) */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Header: estado ao rolar + menu mobile
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    var menuBtn = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!menuBtn || !menu) return;
    var closeBtn = menu.querySelector("[data-menu-close]");
    var root = document.documentElement;
    var hideTimer = null;
    var open = false;

    /* Tudo que fica atrás do overlay vira `inert` enquanto ele está aberto:
       o foco (Tab) e leitores de tela não alcançam a página por baixo. */
    var behind = Array.prototype.filter.call(document.body.children, function (el) {
      return el !== menu && el.tagName !== "SCRIPT";
    });
    function setBehindInert(on) {
      behind.forEach(function (el) {
        if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert");
      });
    }

    function isOpen() { return open; }

    function focusables() {
      return Array.prototype.slice.call(menu.querySelectorAll("a[href], button:not([disabled])"));
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      /* Fallback para navegadores sem `inert`: o Tab circula dentro do menu. */
      if (e.key === "Tab") {
        var items = focusables();
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function openMenu() {
      if (isOpen()) return;
      clearTimeout(hideTimer);
      open = true;
      menu.hidden = false;
      root.classList.add("menu-open");
      setBehindInert(true);
      menuBtn.setAttribute("aria-expanded", "true");
      void menu.offsetWidth;           /* reflow: a transição parte do estado fechado */
      menu.classList.add("is-open");
      if (closeBtn) closeBtn.focus({ preventScroll: true });
      document.addEventListener("keydown", onKeydown);
    }

    /* returnFocus: true ao fechar pelo X / Escape (o foco volta ao
       hamburger); false ao seguir um link (o foco segue a navegação). */
    function closeMenu(returnFocus) {
      if (!isOpen()) return;
      open = false;
      menu.classList.remove("is-open");
      /* Destrava a rolagem ANTES da navegação por âncora acontecer. */
      root.classList.remove("menu-open");
      setBehindInert(false);
      menuBtn.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeydown);
      if (returnFocus) menuBtn.focus({ preventScroll: true });
      hideTimer = window.setTimeout(function () {
        menu.hidden = true;
      }, prefersReducedMotion ? 150 : 300);
    }

    menuBtn.addEventListener("click", function () {
      if (isOpen()) closeMenu(true); else openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeMenu(true); });

    menu.querySelectorAll("[data-menu-link]").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });

    /* Girou o tablet / redimensionou para desktop com o menu aberto: fecha
       e devolve a rolagem (no desktop o overlay nem é exibido). */
    var desktopMq = window.matchMedia("(min-width: 1024px)");
    function onBreakpoint(e) { if (e.matches) closeMenu(false); }
    if (desktopMq.addEventListener) desktopMq.addEventListener("change", onBreakpoint);
    else if (desktopMq.addListener) desktopMq.addListener(onBreakpoint);
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initReveals() {
    var targets = document.querySelectorAll(
      "[data-reveal], [data-reveal-block], [data-reveal-left], [data-reveal-line], [data-reveal-media]"
    );
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  function initHeroEntrance() {
    var figure = document.querySelector("[data-reveal-figure]");

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
      if (figure) figure.style.opacity = 1;
      return;
    }

    /* A fotografia da Hero preenche exatamente a área dela, então a entrada
       usa SÓ opacidade: qualquer translate deixaria uma faixa preta à mostra
       na borda enquanto a animação roda. */
    if (figure) {
      figure.style.opacity = 0;
      figure.style.transition = "opacity 1s cubic-bezier(.16,.84,.44,1) .15s";
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll("[data-reveal-group] [data-reveal]").forEach(function (el, i) {
          el.style.transitionDelay = (i * 90) + "ms";
          el.classList.add("is-visible");
        });
        if (figure) figure.style.opacity = 1;
      });
    });
  }

  /* ---------------------------------------------------------------------
     Indicador discreto de progresso de scroll
     --------------------------------------------------------------------- */
  function initScrollProgress() {
    if (prefersReducedMotion) return;
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = "scaleY(" + progress + ")";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------------
     Hero parallax muito sutil
     --------------------------------------------------------------------- */
  function initHeroParallax() {
    if (prefersReducedMotion) return;
    var intro = document.querySelector(".hero__intro");
    var hero = document.querySelector(".hero");
    if (!intro || !hero) return;

    /* Só o bloco de texto se move. A fotografia agora preenche a Hero inteira:
       deslocá-la abriria uma faixa vazia na borda. */
    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
      intro.style.transform = "translateY(" + (progress * 14) + "px)";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------------
     Contadores de impacto
     --------------------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.dataset.target || "0");
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";

      if (prefersReducedMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }

      var duration = 1000;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     ÚLTIMOS VÍDEOS — 5 cards lado a lado, alimentados pela automação

     Fonte dos dados, em cascata:
       1. /api/instagram-feed  (API oficial da Meta → função → cache; a
          própria função já devolve o último cache se a API falhar)
       2. data/latest-videos.js (fallback estático — só quando o endpoint não
          responde ou não tem nada, ex.: token ainda não configurado ou site
          aberto localmente sem a Netlify)

     Só monta o DOM. Toda a interação (hover, foco, carrossel) é CSS:
     não há mouseenter/mouseleave aqui de propósito.
     --------------------------------------------------------------------- */
  var FEED_ENDPOINT = "/api/instagram-feed";
  var FEED_TIMEOUT_MS = 4500;
  var VIDEOS_TO_SHOW = 5;

  /* Thumbnails do Instagram não informam dimensões; Reels são 9:16. */
  function fromApi(item) {
    return { url: item.url, title: item.title, thumbnail: item.thumbnail, width: 1080, height: 1920 };
  }

  function loadVideos() {
    var fallback = window.BRASIL_JUMBOS_LATEST_VIDEOS || [];
    if (!window.fetch || location.protocol === "file:") return Promise.resolve(fallback);

    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, FEED_TIMEOUT_MS);

    return fetch(FEED_ENDPOINT, { headers: { Accept: "application/json" }, signal: controller && controller.signal })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status)); })
      .then(function (json) {
        var items = (json && Array.isArray(json.items)) ? json.items : [];
        return items.length ? items.map(fromApi) : fallback;
      })
      .catch(function () { return fallback; })
      .then(function (list) { clearTimeout(timer); return list; });
  }

  function initLatestVideos() {
    var section = document.querySelector("[data-videos-section]");
    var deck = document.querySelector("[data-videos-deck]");
    if (!section || !deck) return;

    loadVideos().then(function (videos) {
      if (videos && videos.length) renderDeck(section, deck, videos);
    });
  }

  function renderDeck(section, deck, videos) {
    /* A lista já chega em ordem cronológica (mais recente primeiro) e é
       renderizada assim, da esquerda para a direita. Nenhum card tem papel
       especial: todos recebem a mesma classe. */
    var list = videos.slice(0, VIDEOS_TO_SHOW);

    function buildCard(v, index) {
      if (!v) return null;

      var url = (v.url || "").trim();
      var title = (v.title || "").trim();
      var thumb = (v.thumbnail || "").trim();

      /* Sem URL a carta existe, mas não é link: nada de href="#" nem de
         link morto que o teclado alcança e que não leva a lugar nenhum. */
      var card = document.createElement(url ? "a" : "div");
      card.className = "video-card";
      if (url) {
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute(
          "aria-label",
          (title ? "Assistir: " + title : "Assistir ao vídeo " + (index + 1) + " do Brasil Jumbos") +
            " (abre em nova aba)"
        );
      } else {
        card.classList.add("video-card--pending");
      }

      var poster = document.createElement("span");
      poster.className = "video-card__poster";

      if (thumb) {
        var img = document.createElement("img");
        img.src = thumb;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        /* width/height reais reservam a caixa antes do download (evita CLS)
           sem forçar recorte: o CSS deixa a altura em `auto`. */
        if (v.width) img.width = v.width;
        if (v.height) img.height = v.height;
        /* Enquanto o arquivo ainda não existe (ou o caminho muda), a carta
           cai no estado sem thumbnail em vez de exibir ícone de imagem
           quebrada. Mantém a fileira de pé durante a configuração. */
        img.addEventListener("error", function () {
          img.remove();
          card.classList.add("video-card--no-thumb");
          if (v.width && v.height) poster.style.aspectRatio = v.width + " / " + v.height;
        });
        poster.appendChild(img);
      } else {
        /* Sem arquivo ainda: o card mantém a proporção declarada para a
           fileira não desmontar enquanto as thumbnails não chegam. */
        card.classList.add("video-card--no-thumb");
        if (v.width && v.height) {
          poster.style.aspectRatio = v.width + " / " + v.height;
        }
      }

      var play = document.createElement("span");
      play.className = "video-card__play";
      play.setAttribute("aria-hidden", "true");
      play.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" focusable="false"><use href="#icon-play"></use></svg>';
      poster.appendChild(play);

      card.appendChild(poster);

      /* Título só aparece se for real — nada de placeholder inventado. */
      if (title) {
        var label = document.createElement("span");
        label.className = "video-card__title";
        label.textContent = title;
        card.appendChild(label);
      }

      return card;
    }

    var built = 0;
    list.forEach(function (video, i) {
      var card = buildCard(video, i);
      if (card) {
        deck.appendChild(card);
        built++;
      }
    });

    if (built) section.hidden = false;
  }

  /* ---------------------------------------------------------------------
     Fotos reais do João (data/site-photos.js)
     Espaços já desenhados no HTML ficam ocultos até o arquivo ser
     configurado. Se o arquivo não carregar, o espaço continua oculto —
     nunca aparece ícone de imagem quebrada.
     --------------------------------------------------------------------- */
  function initPhotoSlots() {
    var photos = window.BRASIL_JUMBOS_PHOTOS || {};
    document.querySelectorAll("[data-photo-slot]").forEach(function (figure) {
      var photo = photos[figure.dataset.photoSlot];
      var img = figure.querySelector("img");
      if (!photo || !photo.src || !img) return;

      var caption = figure.querySelector("figcaption");
      if (photo.width) img.width = photo.width;
      if (photo.height) img.height = photo.height;
      img.alt = photo.alt || "João Teixeira no dia a dia do Brasil Jumbos";
      if (caption) {
        if (photo.caption) caption.textContent = photo.caption;
        else caption.remove();
      }
      img.addEventListener("error", function () { figure.hidden = true; });
      img.src = photo.src;
      figure.hidden = false;
    });
  }

  /* ---------------------------------------------------------------------
     Números de seguidores
       1. pinta na hora os números fixos de data/social-config.js;
       2. busca /api/social-counts (APIs oficiais → cache) e troca só as
          redes que vierem com número real. Rede que a API não devolver
          continua com o número fixo. Sem Netlify (arquivo local), fica no 1.
     --------------------------------------------------------------------- */
  var COUNTS_ENDPOINT = "/api/social-counts";

  function paintSocialCounts(counts) {
    document.querySelectorAll("[data-social-count]").forEach(function (el) {
      var value = counts[el.dataset.socialCount];
      if (typeof value !== "number" || !(value > 0)) return;
      el.textContent = new Intl.NumberFormat("pt-BR").format(value) +
        (el.dataset.socialCount === "youtube" ? " inscritos" : " seguidores");
    });
  }

  function initSocialCounts() {
    paintSocialCounts(window.BRASIL_JUMBOS_SOCIAL_COUNTS || {});
    if (!window.fetch || location.protocol === "file:") return;

    fetch(COUNTS_ENDPOINT, { headers: { Accept: "application/json" } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (json) { if (json && json.counts) paintSocialCounts(json.counts); })
      .catch(function () { /* mantém os números fixos */ });
  }

  /* ---------------------------------------------------------------------
     Ano do rodapé
     --------------------------------------------------------------------- */
  function initFooterYear() {
    var el = document.querySelector("[data-current-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initHeroEntrance();
    initReveals();
    initScrollProgress();
    initHeroParallax();
    initCounters();
    initLatestVideos();
    initPhotoSlots();
    initSocialCounts();
    initFooterYear();
  });
})();
