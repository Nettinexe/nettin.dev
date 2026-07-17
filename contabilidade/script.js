/* ============================================================
   Meridiano Contábil — interações (JS puro)
   Menu mobile · contadores animados · carrossel de depoimentos
   · envio do formulário · reveal ao rolar · ano do rodapé
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    setYear();
    setupMenu();
    setupCounters();
    setupTestimonials();
    setupForm();
    setupReveal();
  });

  /* ---------- Ano do rodapé ---------- */
  function setYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Menu mobile ---------- */
  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;
    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------- Contadores animados (algarismos tabulares) ---------- */
  function setupCounters() {
    var bar = document.getElementById("statsBar");
    if (!bar) return;
    var nums = bar.querySelectorAll(".stat-num");

    function format(el, value) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var rounded = Math.round(value);
      var str = rounded.toLocaleString("pt-BR");
      el.textContent = prefix + str + suffix;
    }

    function run() {
      nums.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-target")) || 0;
        if (reduce) { format(el, target); return; }
        var dur = 1400, start = null;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          format(el, target * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }

    if (!("IntersectionObserver" in window)) { run(); return; }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); o.disconnect(); }
      });
    }, { threshold: 0.4 });
    obs.observe(bar);
  }

  /* ---------- Carrossel de depoimentos ---------- */
  function setupTestimonials() {
    var data = [
      {
        text: "Troquei de contador depois de tomar uma multa boba e nunca mais olhei pra trás. A Meridiano me mostrou que eu pagava imposto demais no regime errado — a mudança pagou o honorário do ano inteiro em dois meses.",
        name: "Priscila Werneck",
        role: "Fundadora · Ateliê Werneck Design",
        initials: "PW"
      },
      {
        text: "Abri minha startup sem entender nada de burocracia e eles seguraram minha mão do CNPJ ao primeiro funcionário. Hoje recebo um relatório mensal que eu de fato consigo ler.",
        name: "Diego Ramalho",
        role: "CEO · Rotina Apps",
        initials: "DR"
      },
      {
        text: "O que mais me impressiona é a resposta rápida. Mando uma dúvida no WhatsApp de manhã e antes do almoço já tenho a orientação — com um contador que conhece meu negócio pelo nome.",
        name: "Fernanda Coelho",
        role: "Sócia · Coelho & Bastos Comércio",
        initials: "FC"
      }
    ];
    var i = 0;
    var elText = document.getElementById("quoteText");
    var elName = document.getElementById("quoteName");
    var elRole = document.getElementById("quoteRole");
    var elAv = document.getElementById("quoteAvatar");
    var prev = document.getElementById("quotePrev");
    var next = document.getElementById("quoteNext");
    if (!elText || !prev || !next) return;

    function render() {
      var d = data[i];
      if (!reduce) {
        elText.style.opacity = "0";
        setTimeout(paint, 160);
      } else {
        paint();
      }
      function paint() {
        elText.textContent = d.text;
        elName.textContent = d.name;
        elRole.textContent = d.role;
        elAv.setAttribute("data-initials", d.initials);
        elText.style.opacity = "1";
      }
    }
    elText.style.transition = "opacity .3s ease";
    prev.addEventListener("click", function () { i = (i - 1 + data.length) % data.length; render(); });
    next.addEventListener("click", function () { i = (i + 1) % data.length; render(); });
    // estado inicial (avatar já setado no HTML)
    elAv.setAttribute("data-initials", data[0].initials);
  }

  /* ---------- Envio do formulário ---------- */
  function setupForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.innerHTML =
        '<div class="form-success">' +
        "<strong>Recebido! ✓</strong>" +
        "<p>Obrigado pelo contato. Um contador da Meridiano vai te responder em até 24h úteis com os próximos passos.</p>" +
        "</div>";
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  function setupReveal() {
    var targets = document.querySelectorAll(
      ".areas, .why, .team, .quote, .contact, .stats-inner"
    );
    targets.forEach(function (t) { t.classList.add("reveal"); });
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { obs.observe(t); });
  }
})();
