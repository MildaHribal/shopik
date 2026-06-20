/**
 * Minimal service worker for the admin PWA.
 *
 * Purpose: satisfy install criteria (registered SW with a fetch handler) and
 * provide basic offline fallback for admin shell. We deliberately keep it
 * tiny — no Workbox dependency — so it stays under control and easy to debug.
 */

const CACHE = 'tynky-admin-v1';
const SHELL = [
  '/admin',
  '/manifest.webmanifest',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-first for admin API (we want fresh data when online).
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || new Response('', { status: 503 }))),
    );
    return;
  }

  // SPA navigation: fall back to cached /admin shell when offline.
  if (req.mode === 'navigate' && url.pathname.startsWith('/admin')) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/admin').then((r) => r || fetch(req))),
    );
    return;
  }

  // Stale-while-revalidate for everything else.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});
