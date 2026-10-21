// site.js — comportamento padrão do header/reveal (extraído de /cursos).
// Guardado pra rodar em qualquer página que use /assets/site.css.
(function () {
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var hdr = document.getElementById('hdr');
  if (hdr) window.addEventListener('scroll', function () {
    hdr.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  var tg = document.getElementById('navToggle'), nl = document.getElementById('navLinks');
  if (tg && nl) {
    tg.addEventListener('click', function () { nl.classList.toggle('open'); });
    nl.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nl.classList.remove('open'); });
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }
})();
