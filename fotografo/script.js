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
