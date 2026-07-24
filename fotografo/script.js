// Acordeão de perguntas frequentes — apenas um item aberto por vez
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const button = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');
    const plus = item.querySelector('.faq-plus');

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // fecha todos os itens
      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-plus').textContent = '+';
        other.querySelector('.faq-answer').hidden = true;
      });

      // reabre o clicado, exceto se já estava aberto (comportamento de alternância)
      if (!isOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        plus.textContent = '–';
        answer.hidden = false;
      }
    });
  });
});

// Estante de portfólio
document.addEventListener('DOMContentLoaded', () => {
  const strip = document.querySelector('.gallery-strip');
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  if (!strip || !items.length) return;

  const isTouch = window.matchMedia('(hover: none)').matches;

  if (!isTouch) {
    // Mouse/trackpad: clique ou foco por teclado também fixam a expansão (reforço ao hover)
    items.forEach((item) => {
      item.addEventListener('click', () => {
        items.forEach((other) => other.classList.remove('is-active'));
        item.classList.add('is-active');
      });
    });
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  // Touch: destaca a foto centralizada enquanto o usuário arrasta o carrossel
  const setActive = (activeItem) => {
    items.forEach((item) => {
      const active = item === activeItem;
      item.classList.toggle('is-active', active);
      item.classList.toggle('is-dimmed', !active);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const mostVisible = entries.reduce((best, entry) => (
      !best || entry.intersectionRatio > best.intersectionRatio ? entry : best
    ), null);
    if (mostVisible && mostVisible.intersectionRatio > 0) setActive(mostVisible.target);
  }, { root: strip, threshold: [0.25, 0.5, 0.75, 1] });

  items.forEach((item) => observer.observe(item));

  // Toque: tocar numa foto expande para o tamanho real; tocar de novo recolhe.
  // Usamos pointerdown/pointerup (em vez de "click") porque dentro de um contêiner
  // com scroll horizontal os navegadores mobile costumam suprimir o clique quando
  // detectam qualquer leve movimento do dedo durante o toque, tratando-o como arraste.
  const toggleExpanded = (item) => {
    const alreadyExpanded = item.classList.contains('is-expanded');
    items.forEach((other) => other.classList.remove('is-expanded'));
    if (!alreadyExpanded) {
      item.classList.add('is-expanded');
      item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  items.forEach((item) => {
    let pointerStart = null;
    let handledByPointer = false;

    item.addEventListener('pointerdown', (event) => {
      pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
    });

    item.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const dx = Math.abs(event.clientX - pointerStart.x);
      const dy = Math.abs(event.clientY - pointerStart.y);
      const dt = Date.now() - pointerStart.time;
      pointerStart = null;
      if (dx < 10 && dy < 10 && dt < 600) {
        handledByPointer = true;
        toggleExpanded(item);
      }
    });

    // Reforço para teclado/leitores de tela (não recebem eventos de ponteiro)
    item.addEventListener('click', () => {
      if (handledByPointer) { handledByPointer = false; return; }
      toggleExpanded(item);
    });
  });
});

// Animação de entrada da seção "Caio Vidal" ao rolar até ela
document.addEventListener('DOMContentLoaded', () => {
  const target = document.querySelector('.bigname-inner');
  if (!target || !('IntersectionObserver' in window)) return;

  target.classList.add('bigname-observe');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        target.classList.add('in-view');
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(target);
});
