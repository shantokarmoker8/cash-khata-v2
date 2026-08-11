// service-worker.js
const CACHE_NAME = 'cash-khata-cache-v1';
const STATIC_ASSETS = [
  './index.html',
  './login.html',
  './dashboard.html',
  './sales.html',
  './purchase.html',
  './customers.html',
  './suppliers.html',
  './expenses.html',
  './cash.html',
  './settings.html',
  './users.html',
  './manifest.json',
  './assets/logo.png',
  './js/firebase-config.js',
  './js/db-helpers.js',
  './js/auth-guard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service worker cache addAll failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isExternal =
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('googleapis.com') ||
    url.origin.includes('gstatic.com') ||
    url.origin.includes('cdn.jsdelivr.net') ||
    url.origin.includes('cdnjs.cloudflare.com') ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com');

  if (isExternal) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            event.request.method === 'GET' &&
            networkResponse &&
            networkResponse.status === 200
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./login.html');
          }
        });
    })
  );
});