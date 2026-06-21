// PWA: Service Worker registrieren + „App installieren“-Button.
// - Chrome/Android/Desktop: fängt das `beforeinstallprompt`-Event ab und löst
//   beim Klick den nativen Installations-Dialog aus.
// - iOS/Safari: kennt kein solches Event -> zeigt eine kurze Anleitung
//   (Teilen-Symbol -> „Zum Home-Bildschirm“).

const DISMISS_KEY = 'pixletics.install.dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS meldet sich als Mac mit Touch
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function initPWA() {
  // Service Worker registrieren (scope = App-Verzeichnis, da sw.js im Root liegt).
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  const banner = document.getElementById('install-banner');
  const installBtn = document.getElementById('ib-install');
  const dismissBtn = document.getElementById('ib-dismiss');
  if (!banner) return;

  // Schon installiert oder bewusst weggeklickt -> nichts zeigen.
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch {} // Storage kann blockiert sein
  if (isStandalone() || dismissed) return;

  let deferred = window.__bip || null; // evtl. früh im <head> abgefangen
  const showBanner = () => { banner.hidden = false; };
  const hideBanner = () => { banner.hidden = true; };

  if (deferred) showBanner();

  // Falls das Event erst später kommt:
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    showBanner();
  });
  window.addEventListener('appinstalled', () => {
    hideBanner();
    deferred = null;
  });

  // iOS hat kein Event -> Button trotzdem anbieten (führt zur Anleitung).
  if (isIOS()) showBanner();

  installBtn?.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch {}
      deferred = null;
      hideBanner();
    } else if (isIOS()) {
      const ov = document.getElementById('ios-install');
      if (ov) ov.hidden = false;
    } else {
      alert('Installieren über das Browser-Menü: „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.');
    }
  });

  dismissBtn?.addEventListener('click', () => {
    hideBanner();
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {} // Storage kann blockiert sein
  });

  document.getElementById('ios-close')?.addEventListener('click', () => {
    const ov = document.getElementById('ios-install');
    if (ov) ov.hidden = true;
  });
}
