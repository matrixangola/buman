/* =========================================
   B.Uman · faq.js
   Accordion FAQ · fecha os outros ao abrir
   ========================================= */

(() => {
  'use strict';

  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const q = item.querySelector('.faq-q');
    q?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // fecha todos
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });

      // abre o clicado (se estava fechado)
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
