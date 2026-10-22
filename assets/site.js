// site.js — comportamento padrão: tema claro/escuro (toggle), logo real, header, reveal.
(function () {
  var root = document.documentElement;

  // ── Tema (claro = padrão) ──
  var tema = localStorage.getItem('tema') || 'light';
  root.setAttribute('data-theme', tema);

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Logo real na marca (substitui o placeholder de barrinhas, se houver) ──
  var brand = document.querySelector('header .brand');
  if (brand && !brand.querySelector('img')) {
    brand.innerHTML =
      '<img class="logo-light" src="/assets/logo-bald.svg" alt="Iago Bald">' +
      '<img class="logo-dark" src="/assets/logo-bald-dark.svg" alt="Iago Bald">';
  }

  // ── Botão de tema (injetado no fim dos nav-links) ──
  var MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function icon(t) { return t === 'dark' ? SUN : MOON; }
  var nl = document.getElementById('navLinks') || document.querySelector('header .nav-links');
  if (nl && !nl.querySelector('.theme-toggle')) {
    var tb = document.createElement('button');
    tb.className = 'theme-toggle'; tb.type = 'button'; tb.setAttribute('aria-label', 'Alternar tema claro/escuro');
    tb.innerHTML = icon(tema);
    tb.addEventListener('click', function () {
      tema = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      root.setAttribute('data-theme', tema); localStorage.setItem('tema', tema); tb.innerHTML = icon(tema);
    });
    nl.appendChild(tb);
  }

  // ── Header scroll ──
  var hdr = document.getElementById('hdr');
  if (hdr) window.addEventListener('scroll', function () { hdr.classList.toggle('scrolled', window.scrollY > 20); }, { passive: true });

  // ── Menu mobile ──
  var tg = document.getElementById('navToggle'), nav = document.getElementById('navLinks');
  if (tg && nav) {
    tg.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  // ── Reveal ──
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }
})();
