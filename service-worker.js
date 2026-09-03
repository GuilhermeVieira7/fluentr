/* FLUENTR — service-worker.js
   Offline-first strategy: precache the full app shell (HTML/CSS/JS/data) on
   install, then serve cache-first for same-origin static assets, with a
   network-first pass for navigation requests (so content updates when
   online) and a cache/offline.html fallback when there's no network. */

const CACHE_NAME = 'fluentr-v4-bugfixes';

const PRECACHE_URLS = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './css/tokens.css', './css/base.css', './css/components.css', './css/pages.css', './css/responsive.css',
  './js/router.js', './js/app.js', './js/ui.js', './js/lessonEngine.js',
  './js/core/storage.js', './js/core/dataService.js', './js/core/gamification.js', './js/core/profiles.js',
  './js/core/mascot.js', './js/core/feedback.js', './js/core/pwa.js',
  './data/curriculum.js', './data/badges.js', './data/traps.js', './data/say.js', './data/writing.js',
  './data/technical.js', './data/sos.js', './data/lessons.js', './data/coupleChallenges.js', './data/simulators.js', './data/placement.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-maskable-192.png', './assets/icons/icon-maskable-512.png',
  './assets/mascot/flu-idle.png', './assets/mascot/flu-happy.png', './assets/mascot/flu-celebrating.png',
  './assets/mascot/flu-proud.png', './assets/mascot/flu-sad.png', './assets/mascot/flu-streak-danger.png',
  './assets/mascot/flu-welcome-back.png', './assets/mascot/flu-encouraging.png', './assets/mascot/flu-thinking.png',
  './assets/mascot/flu-listening.png', './assets/mascot/flu-speaking.png', './assets/mascot/flu-writing.png',
  './assets/mascot/flu-sos.png', './assets/mascot/flu-tech.png', './assets/mascot/flu-love.png', './assets/mascot/flu-competitive.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigation requests: try network first (fresh app shell), fall back to
  // cache, then to the offline page if nothing is cached either.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./offline.html')))
    );
    return;
  }

  // Same-origin static assets: cache-first, refresh cache in the background.
  if (new URL(req.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
