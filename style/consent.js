/*
 * Süti-hozzájárulás + Google Analytics + Meta Pixel – egyetlen fájl, minden oldalon a <head>-ben:
 *   <script src="style/consent.js" defer></script>
 *
 * BEÁLLÍTÁS: csak az alábbi két azonosítót kell kicserélni (amíg placeholder, semmi nem töltődik be).
 * Kategóriák: szükséges (mindig), analitika (Google Analytics), marketing (Meta Pixel).
 * Elutasítás az alapértelmezett: hozzájárulás előtt semmilyen külső szkript nem töltődik be.
 */
(() => {
  'use strict';

  const GA_ID = 'G-XXXXXXXXXX';                  // Google Analytics 4 mérési azonosító
  const META_PIXEL_ID = 'META_PIXEL_ID_PLACEHOLDER'; // Meta Pixel azonosító (csak számjegyek)

  const CONSENT_KEY = 'pm_cookie_consent_v1';
  const SUBMIT_FLAG = 'pm_application_submit_pending';
  const BANNER_ID = 'cookie-banner';

  const gaEnabled = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && !/^G-X+$/.test(GA_ID);
  const pixelEnabled = /^\d+$/.test(META_PIXEL_ID);
  const page = location.pathname.split('/').pop();
  const loaded = { ga: false, pixel: false };

  // ---------- Tárolás ----------
  const readConsent = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      return c && typeof c === 'object' ? { analytics: c.analytics === true, marketing: c.marketing === true } : null;
    } catch (_) { return null; }
  };
  const writeConsent = (analytics, marketing) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, analytics, marketing, updatedAt: new Date().toISOString() }));
    } catch (_) { /* privát mód: a döntés csak az oldal bezárásáig él */ }
  };

  // ---------- Google Analytics ----------
  function loadAnalytics() {
    if (loaded.ga || !gaEnabled) return;
    loaded.ga = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // ---------- Meta Pixel ----------
  function loadPixel() {
    if (loaded.pixel || !pixelEnabled) return;
    loaded.pixel = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
    if (page === 'dijak-es-tudnivalok.html') fbq('track', 'ViewContent', { content_name: 'Coachingcsomagok' });
    if (page === 'jelentkezes-sikeres.html' && new URLSearchParams(location.search).get('submitted') === '1') {
      try {
        if (sessionStorage.getItem(SUBMIT_FLAG) === '1') {
          fbq('track', 'Lead', { content_name: 'Coaching jelentkezés' });
          sessionStorage.removeItem(SUBMIT_FLAG);
        }
      } catch (_) { /* nincs sessionStorage: Lead nélkül folytatjuk */ }
    }
  }

  // Visszavonáskor a már beállított sütiket is töröljük
  function clearCookies(prefixes) {
    const host = location.hostname, parts = host.split('.');
    const domains = [host, '.' + host, parts.length > 2 ? '.' + parts.slice(-2).join('.') : '.' + host];
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (!prefixes.some((p) => name.startsWith(p))) return;
      domains.forEach((d) => { document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d; });
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  // ---------- Döntés alkalmazása ----------
  function applyConsent(c, { reloadOnRevoke = false } = {}) {
    if (c.analytics) loadAnalytics();
    if (c.marketing) loadPixel();
    const revoked = (loaded.ga && !c.analytics) || (loaded.pixel && !c.marketing);
    if (!c.analytics) clearCookies(['_ga', '_gid', '_gat']);
    if (!c.marketing) clearCookies(['_fbp', '_fbc']);
    // Már betöltött szkriptet csak újratöltéssel lehet leállítani
    if (revoked && reloadOnRevoke) location.reload();
  }

  function save(analytics, marketing) {
    writeConsent(analytics, marketing);
    closeBanner();
    applyConsent({ analytics, marketing }, { reloadOnRevoke: true });
  }

  // ---------- Banner (a korábbi, régi stílusban) ----------
  const BTN = 'bg-[#8C7A6B] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#726255] transition-all cursor-pointer text-center leading-snug w-full sm:w-auto sm:max-w-[16rem]';
  const ROW = 'flex gap-3 items-start cursor-pointer';

  const closeBanner = () => document.getElementById(BANNER_ID)?.remove();

  function openBanner(showSettings = false) {
    closeBanner();
    const saved = readConsent() || { analytics: false, marketing: false };
    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Süti-beállítások');
    banner.className = 'fixed bottom-0 inset-x-0 z-50 bg-[#2C2A29] text-[#FBF9F5] p-4 sm:p-6 shadow-2xl border-t border-[#4A4440]';
    banner.innerHTML = `
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex-1 min-w-0 space-y-3">
          <p class="text-xs sm:text-sm text-[#A89F95] text-center sm:text-left leading-relaxed">
            Ez a weboldal a működéshez szükséges technikai tárolást használ. Hozzájárulásod esetén a Google Analytics
            látogatottsági statisztikát készít, a Meta Pixel pedig marketing- és konverziómérési célból adatokat
            továbbíthat a Meta részére. A hozzájárulás önkéntes, elutasíthatod, és döntésedet később is módosíthatod.
            Részletek az <a href="adatkezelesi-tajekoztato.html" class="underline text-white hover:text-[#8C7A6B]">Adatkezelési Tájékoztatóban</a>.
          </p>
          <div data-settings class="${showSettings ? '' : 'hidden'} space-y-3 text-xs sm:text-sm text-[#A89F95] text-left">
            <label class="${ROW}"><input type="checkbox" checked disabled class="mt-1"><span><strong class="text-white">Szükséges</strong><br>A weboldal működése és a süti-döntésed megjegyzése. Mindig aktív.</span></label>
            <label class="${ROW}"><input type="checkbox" data-analytics class="mt-1" ${saved.analytics ? 'checked' : ''}><span><strong class="text-white">Analitika</strong> – Google Analytics<br>Anonimizált látogatottsági statisztika az oldal fejlesztéséhez.</span></label>
            <label class="${ROW}"><input type="checkbox" data-marketing class="mt-1" ${saved.marketing ? 'checked' : ''}><span><strong class="text-white">Marketing és konverziómérés</strong> – Meta Pixel<br>A hirdetések hatékonyságának és a coachingoldalak iránti érdeklődésnek a mérése.</span></label>
          </div>
        </div>
        <div class="flex flex-col lg:flex-row gap-3 w-full sm:w-auto sm:flex-shrink-0 justify-center items-stretch">
          <button type="button" data-act="reject" class="${BTN}">Csak a szükséges sütik elfogadása</button>
          <button type="button" data-act="settings" class="${BTN} ${showSettings ? 'hidden' : ''}">Beállítások</button>
          <button type="button" data-act="save" class="${BTN} ${showSettings ? '' : 'hidden'}">Kiválasztottak mentése</button>
          <button type="button" data-act="all" class="${BTN}">Minden süti elfogadása</button>
        </div>
      </div>`;
    document.body.appendChild(banner);

    const q = (s) => banner.querySelector(s);
    q('[data-act="reject"]').onclick = () => save(false, false);
    q('[data-act="all"]').onclick = () => save(true, true);
    q('[data-act="save"]').onclick = () => save(q('[data-analytics]').checked, q('[data-marketing]').checked);
    q('[data-act="settings"]').onclick = () => {
      q('[data-settings]').classList.remove('hidden');
      q('[data-act="settings"]').classList.add('hidden');
      q('[data-act="save"]').classList.remove('hidden');
    };
  }

  // Állandó „Süti-beállítások” link a láblécben (a döntés bármikor módosítható)
  function addSettingsLink() {
    if (document.querySelector('[data-cookie-settings]')) return;
    const link = document.createElement('button');
    link.type = 'button';
    link.setAttribute('data-cookie-settings', '');
    link.textContent = 'Süti-beállítások';
    link.addEventListener('click', () => openBanner(true));
    const row = document.querySelector('footer .flex-wrap');
    if (row) {
      link.className = 'hover:text-white transition-colors cursor-pointer';
      row.appendChild(link);
    } else {
      link.className = 'fixed bottom-3 left-3 z-40 bg-[#2C2A29] text-white border border-[#8C7A6B] rounded-full px-3 py-2 text-xs cursor-pointer';
      document.body.appendChild(link);
    }
  }

  // Jelentkezési űrlap: a Lead esemény csak marketing-hozzájárulással, sikeres beküldés után fut
  function watchApplicationForm() {
    document.getElementById('application-form')?.addEventListener('submit', () => {
      try { if (readConsent()?.marketing) sessionStorage.setItem(SUBMIT_FLAG, '1'); } catch (_) { }
    });
  }

  function init() {
    const consent = readConsent();
    if (consent) applyConsent(consent); else openBanner(false);
    addSettingsLink();
    watchApplicationForm();
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
