/*
 * Meta Pixel + consent management baseline for profitaljmagadbol.hu
 * IMPORTANT: Replace META_PIXEL_ID_PLACEHOLDER with the numeric Pixel ID from Meta Events Manager.
 * This script does not load Meta code until marketing consent is explicitly granted.
 */
(() => {
  'use strict';
  const CONSENT_KEY = 'pm_cookie_consent_v1';
  const META_PIXEL_ID = 'META_PIXEL_ID_PLACEHOLDER';
  const readConsent = () => {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); }
    catch (_) { return null; }
  };
  let pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded || META_PIXEL_ID === 'META_PIXEL_ID_PLACEHOLDER' || !/^\d+$/.test(META_PIXEL_ID)) return;
    pixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    if (/dijak-es-tudnivalok\.html$/.test(location.pathname)) window.fbq('track', 'ViewContent', {content_name:'Coachingcsomagok'});
    if (/jelentkezes-sikeres\.html$/.test(location.pathname) && new URLSearchParams(location.search).get('submitted') === '1') {
      let pending = false;
      try { pending = sessionStorage.getItem('pm_application_submit_pending') === '1'; } catch (_) {}
      if (pending) {
        window.fbq('track', 'Lead', {content_name:'Coaching jelentkezés'});
        try { sessionStorage.removeItem('pm_application_submit_pending'); } catch (_) {}
      }
    }
  }
  function setConsent(marketing) {
    const record = { necessary: true, marketing: !!marketing, updatedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    hideBanner();
    if (record.marketing) loadPixel();
    updateSettingsButton();
    // Ha a Pixel már betöltődött, újratöltjük az oldalt, hogy a visszavonás után
    // a további oldalműveletek már ne a korábban betöltött Pixel-példányt használják.
    if (!record.marketing && pixelLoaded) location.reload();
  }
  function hideBanner() { const b=document.getElementById('pm-cookie-banner'); if(b) b.remove(); }
  function openBanner(showSettings=false) {
    hideBanner();
    const banner=document.createElement('section');
    banner.id='pm-cookie-banner';
    banner.setAttribute('role','dialog'); banner.setAttribute('aria-modal','false'); banner.setAttribute('aria-labelledby','pm-cookie-title');
    banner.style.cssText='position:fixed;z-index:99999;left:0;right:0;bottom:0;background:#2C2A29;color:#FBF9F5;padding:20px;box-shadow:0 -8px 28px rgba(0,0,0,.25);font:14px/1.5 system-ui,sans-serif;max-height:85vh;overflow:auto;';
    const saved=readConsent();
    banner.innerHTML=`<div style="max-width:1100px;margin:auto"><h2 id="pm-cookie-title" style="font-size:18px;font-weight:700;margin:0 0 8px">Süti-beállítások</h2><p style="margin:0 0 12px;color:#e8e0d8">A weboldal működéséhez szükséges technikai tárolást használunk. Hozzájárulásod esetén a Meta Pixel marketing- és konverziómérési célból adatokat továbbíthat a Meta részére. A marketingmérést elutasíthatod, és döntésedet később is módosíthatod. Részletek az <a href="adatkezelesi-tajekoztato.html" style="color:#fff;text-decoration:underline">Adatkezelési tájékoztatóban</a>.</p><div id="pm-cookie-settings" style="${showSettings?'':'display:none;'}padding:10px 0 14px"><label style="display:flex;gap:10px;align-items:flex-start"><input id="pm-marketing-toggle" type="checkbox" style="margin-top:4px" ${saved && saved.marketing ? 'checked':''}><span><strong>Marketing és konverziómérés</strong><br>Meta Pixel – a hirdetések hatékonyságának és a coachingoldalak iránti érdeklődésnek a mérése.</span></label><p style="font-size:12px;color:#cfc5bb;margin:8px 0 0">A szükséges működési tárolás mindig aktív. A marketing kategória alapértelmezetten nincs bekapcsolva.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button id="pm-reject" type="button" style="border:1px solid #d8ccc1;background:transparent;color:#fff;padding:10px 16px;border-radius:999px;cursor:pointer">Csak szükséges</button><button id="pm-settings" type="button" style="border:1px solid #d8ccc1;background:transparent;color:#fff;padding:10px 16px;border-radius:999px;cursor:pointer">Beállítások</button><button id="pm-accept" type="button" style="border:1px solid #8C7A6B;background:#8C7A6B;color:#fff;padding:10px 16px;border-radius:999px;cursor:pointer">Marketing elfogadása</button><button id="pm-save" type="button" style="display:${showSettings?'inline-block':'none'};border:1px solid #8C7A6B;background:#8C7A6B;color:#fff;padding:10px 16px;border-radius:999px;cursor:pointer">Kiválasztottak mentése</button></div></div>`;
    document.body.appendChild(banner);
    banner.querySelector('#pm-reject').addEventListener('click',()=>setConsent(false));
    banner.querySelector('#pm-accept').addEventListener('click',()=>setConsent(true));
    banner.querySelector('#pm-settings').addEventListener('click',()=>openBanner(true));
    banner.querySelector('#pm-save').addEventListener('click',()=>setConsent(!!banner.querySelector('#pm-marketing-toggle')?.checked));
  }
  function updateSettingsButton() {
    let btn=document.getElementById('pm-cookie-settings-button');
    if(!btn){ btn=document.createElement('button'); btn.id='pm-cookie-settings-button'; btn.type='button'; btn.textContent='Süti-beállítások'; btn.style.cssText='position:fixed;z-index:9998;bottom:12px;left:12px;background:#2C2A29;color:#fff;border:1px solid #8C7A6B;border-radius:999px;padding:8px 12px;font:12px system-ui,sans-serif;cursor:pointer;'; btn.addEventListener('click',()=>openBanner(true)); document.body.appendChild(btn); }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const consent=readConsent();
    if (consent && consent.marketing === true) loadPixel();
    if (!consent) openBanner(false);
    updateSettingsButton();
  });
})();
