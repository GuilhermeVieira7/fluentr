/* FLUENTR — service-worker.js
   Offline-first strategy: precache the full app shell (HTML/CSS/JS/data) on
   install, then serve cache-first for same-origin static assets, with a
   network-first pass for navigation requests (so content updates when
   online) and a cache/offline.html fallback when there's no network. */

const CACHE_NAME = 'fluentr-v7-presence-freeze';

// Cached alongside everything else below despite being cross-origin — see
// the fetch handler's explicit check for this exact URL. It's boot-critical
// (js/core/supabaseAuth.js references window.supabase synchronously) but
// same-origin-only caching would never touch a CDN script, so without this
// the app could fail to boot offline in Supabase mode even with every local
// file cached. Keep this in sync with the <script src> in index.html.
const SUPABASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.js';

const PRECACHE_URLS = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './css/tokens.css', './css/base.css', './css/components.css', './css/pages.css', './css/responsive.css',
  './js/router.js', './js/app.js', './js/ui.js', './js/lessonEngine.js',
  './js/core/config.js', './js/core/storage.js', './js/core/dataService.js',
  './js/core/supabaseAuth.js', './js/core/supabaseDataProvider.js', './js/core/dataServiceSelect.js',
  './js/core/gamification.js', './js/core/profiles.js',
  './js/core/mascot.js', './js/core/feedback.js', './js/core/pwa.js', './js/core/push.js', './js/core/aiClient.js', './js/core/presence.js',
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
      .then((cache) => cache.addAll(PRECACHE_URLS)
        // The CDN script is cached best-effort, separately from the atomic
        // addAll above: cache.addAll is all-or-nothing, and a cross-origin
        // fetch is far more likely to transiently fail (CORS hiccup, CDN
        // blip) than any of this app's own files — one bad CDN fetch
        // shouldn't be able to fail precaching of the entire local app shell.
        .then(() => cache.add(SUPABASE_CDN_URL).catch(() => { /* served from network or the browser's HTTP cache if this never lands */ })))
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

  // Same-origin static assets, plus the one cross-origin file this app
  // depends on to boot (see SUPABASE_CDN_URL) — cache-first, refresh cache
  // in the background. Every other cross-origin request (the actual
  // Supabase API calls) deliberately falls through uncached below: those
  // must always hit the network fresh.
  if (new URL(req.url).origin === self.location.origin || req.url === SUPABASE_CDN_URL) {
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

// Real Web Push (see js/core/push.js + supabase/functions/send-daily-reminders)
// — this fires even when the app is fully closed, unlike core/pwa.js's
// Notification-API reminder which only runs while the app is open.
self.addEventListener('push', (event) => {
  let data = { title: 'FluentR', body: "Don't lose your streak today!" };
  try { if (event.data) data = event.data.json(); } catch (e) { /* keep default */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'assets/icons/icon-192.png',
      badge: 'assets/icons/icon-192.png',
      tag: 'fluentr-reminder'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow('./');
    })
  );
});
