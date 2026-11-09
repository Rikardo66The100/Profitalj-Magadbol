/* Ragadós mobil CTA: az oldal első CTA-gombját klónozza (szöveg és stílus változatlan),
   és akkor mutatja, ha az eredeti gomb kigörgetett a képernyőről. */
(() => {
  'use strict';
  const mq = window.matchMedia('(max-width: 1023.98px)');
  const src = [...document.querySelectorAll('a.gold-primary-button[href^="kapcsolat.html"]')]
    .find((a) => !a.closest('header, footer, #m-cta'));
  const footer = document.querySelector('footer');
  if (!src || !footer) return;

  const bar = document.createElement('div');
  bar.id = 'm-cta';
  const btn = src.cloneNode(true);
  btn.removeAttribute('id');
  btn.removeAttribute('target');
  btn.setAttribute('href', 'kapcsolat.html#idopontfoglalas');
  bar.appendChild(btn);
  document.body.appendChild(bar);
  document.documentElement.classList.add('m-cta-on');

  const state = { src: true, footer: false };
  const paintBg = () => {
    const c = [document.body, document.documentElement]
      .map((el) => getComputedStyle(el).backgroundColor)
      .find((v) => v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent');
    bar.style.backgroundColor = c || '#FBF9F5';
  };
  const blocked = () =>
    document.getElementById('cookie-banner') ||
    document.getElementById('menu-btn')?.getAttribute('aria-expanded') === 'true';
  const update = () => {
    const show = mq.matches && !state.src && !state.footer && !blocked();
    bar.classList.toggle('is-visible', !!show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    btn.tabIndex = show ? 0 : -1;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { state[e.target === src ? 'src' : 'footer'] = e.isIntersecting; });
    update();
  });
  io.observe(src);
  io.observe(footer);

  // süti-banner megjelenése/eltűnése, mobilmenü, téma- és méretváltás
  new MutationObserver(update).observe(document.body, { childList: true });
  document.getElementById('menu-btn')?.addEventListener('click', () => setTimeout(update, 0));
  document.addEventListener('themechange', () => setTimeout(paintBg, 700));
  (mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update));
  paintBg();
  update();
})();
