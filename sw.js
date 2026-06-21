// Service Worker für pixletics (PWA): macht die App installierbar & offline-fähig.
// Strategie: Network-first für eigene Dateien (immer aktuell, sonst Cache als
// Offline-Fallback). Fremd-URLs (Radio-Streams, SomaFM, Spotify) gehen direkt
// ans Netz und werden NICHT gecacht.
const CACHE = 'pixletics-v95';
const ASSETS = [
  './',
  './index.html',
  './vital.html',
  './privacy.html',
  './impressum.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/content.js',
  './assets/js/content/vital.js',
  './assets/js/store.js',
  './assets/js/exercises.js',
  './assets/js/engine.js',
  './assets/js/setgen.js',
  './assets/js/figure.js',
  './assets/js/howto.js',
  './assets/js/audio.js',
  './assets/js/coach.js',
  './assets/js/radio.js',
  './assets/js/spotify.js',
  './assets/js/share.js',
  './assets/js/gooey.js',
  './assets/js/pwa.js',
  './assets/audio/applause.wav',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Radio/Spotify/SomaFM -> direkt ans Netz

  // Network-first mit erzwungener Revalidierung (kein veralteter Browser-Cache):
  // immer frische Inhalte, Cache nur als Offline-Fallback.
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('./index.html'))),
  );
});
