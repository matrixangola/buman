/* =========================================
   B.Uman · main.js
   Nav, mobile menu, scroll reveal, chat toggle
   ========================================= */

(() => {
  'use strict';

  /* ---------- MOBILE MENU ---------- */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => io.observe(el));

  /* ---------- SMOOTH SCROLL (fallback + offset navbar) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const navH = 70;
      const y = target.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- NAVBAR SCROLL STATE ---------- */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });

  /* ---------- CHAT TOGGLE ---------- */
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose = document.getElementById('chatClose');

  function openChat() {
    chatWindow?.classList.add('open');
    chatToggle?.classList.add('hide-badge');
    document.getElementById('chatInput')?.focus();
  }
  function closeChat() {
    chatWindow?.classList.remove('open');
  }

  chatToggle?.addEventListener('click', () => {
    chatWindow?.classList.contains('open') ? closeChat() : openChat();
  });
  chatClose?.addEventListener('click', closeChat);

  /* Botões "Marcar" abrem o chat */
  document.querySelectorAll('[data-chat-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openChat();
    });
  });

  /* Botões de serviço pré-preenchem o chat */
  document.querySelectorAll('[data-service]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const svc = btn.getAttribute('data-service');
      openChat();
      window.dispatchEvent(new CustomEvent('buman:service', { detail: svc }));
    });
  });

  /* Pulse inicial do botão chat até abrir pela 1ª vez */
  setTimeout(() => {
    if (!localStorage.getItem('buman_chat_seen')) {
      chatToggle?.classList.add('pulse');
    }
  }, 3000);

  chatToggle?.addEventListener('click', () => {
    localStorage.setItem('buman_chat_seen', '1');
    chatToggle.classList.remove('pulse');
  }, { once: true });

})();
