/* ============================================================
   Diego Farias — Engenharia Civil
   Comportamentos: menu mobile, carimbo de prancha (abas),
   FAQ em acordeão, revelação ao rolar e envio do formulário.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Menu mobile ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("navLinks");
  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("aberto");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    };
    menuToggle.addEventListener("click", () => {
      const aberto = nav.classList.toggle("aberto");
      menuToggle.setAttribute("aria-expanded", String(aberto));
      menuToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---------- Carimbo de prancha (abas 01–04) ---------- */
  const disciplinas = [
    {
      n: "01",
      glyph: "M4 20h16M4 20V6l16 14M8.5 20v-3M12 20v-6.2M15.5 20v-9.4",
      title: "Projetos Estruturais",
      text: "Cálculo estrutural em concreto armado, alvenaria estrutural e estruturas metálicas, com memorial de cálculo detalhado e ART inclusa.",
    },
    {
      n: "02",
      glyph: "M10.5 3.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20.5 20.5l-5-5M7.2 10.5h6.6M10.5 7.2v6.6",
      title: "Laudos e Perícias",
      text: "Laudos técnicos, vistorias prediais e perícias de engenharia para financiamento, seguro, compra de imóvel e processos judiciais.",
    },
    {
      n: "03",
      glyph: "M4 18.5a8 8 0 0 1 16 0M12 6v4M3.5 18.5h17M12 6a2 2 0 0 1 2 2",
      title: "Gestão de Obras",
      text: "Acompanhamento técnico, cronograma físico-financeiro e fiscalização de obras do lançamento da fundação até a entrega das chaves.",
    },
    {
      n: "04",
      glyph: "M4 12.5 12 5l8 7.5M6 11v9.5h12V11M10 20.5v-5.5h4v5.5",
      title: "Reformas e Regularização",
      text: "Projetos de reforma e ampliação, adequação de imóveis a normas técnicas e regularização junto à prefeitura, incluindo habite-se.",
    },
  ];

  const card = document.querySelector(".tabcard");
  if (card) {
    const kickerNum = card.querySelector(".tabcard-kicker span:last-child");
    const media = card.querySelector(".tabcard-media svg path");
    const num = card.querySelector(".tabcard-num");
    const title = card.querySelector(".tabcard-copy h3");
    const text = card.querySelector(".tabcard-copy p");
    const buttons = card.querySelectorAll(".tabcard-railbtn");

    const render = (i) => {
      const d = disciplinas[i];
      kickerNum.textContent = d.n + " / 04";
      media.setAttribute("d", d.glyph);
      num.textContent = d.n;
      title.textContent = d.title;
      text.textContent = d.text;
      buttons.forEach((b, bi) => {
        const active = bi === i;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
    };

    buttons.forEach((b, i) => b.addEventListener("click", () => render(i)));
  }

  /* ---------- FAQ em acordeão (um item aberto por vez) ---------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector("button");
    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((other) => {
        other.classList.remove("open");
        other.querySelector("button").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-plus").textContent = "+";
        const ans = other.querySelector(".faq-answer");
        if (ans) ans.hidden = true;
      });
      if (!isOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        item.querySelector(".faq-plus").textContent = "–";
        const ans = item.querySelector(".faq-answer");
        if (ans) ans.hidden = false;
      }
    });
  });

  /* ---------- Revelação ao rolar ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => obs.observe(el));
  }

  /* ---------- Envio do formulário ---------- */
  const form = document.querySelector(".form-card");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.innerHTML =
        '<div class="form-success">' +
        "<strong>Solicitação enviada!</strong>" +
        "<p>Obrigado pelo contato. Retornaremos em até 24h úteis com os próximos passos do seu orçamento.</p>" +
        "</div>";
    });
  }
});
