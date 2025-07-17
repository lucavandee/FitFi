// ✅ Service Worker voor FitFi PWA

const CACHE_NAME = 'fitfi-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/preload-fix.js'
];

// ✅ INSTALL EVENT – Cache statische assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Cache geopend');
      return cache.addAll(urlsToCache);
    })
  );
});

// ✅ FETCH EVENT – Serve from cache, fallback naar netwerk, en cache nieuwe HTTP-verzoeken
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response als beschikbaar
      if (cachedResponse) {
        return cachedResponse;
      }

      // Clone de originele request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(networkResponse => {
        // Valideer de response
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // Clone de response voor caching
        const responseToCache = networkResponse.clone();

        // ✅ Alleen HTTP(S) GET requests cachen, GEEN chrome-extension://
        if (
          event.request.method === 'GET' &&
          event.request.url.startsWith('http') &&
          !event.request.url.includes('/api/')
        ) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      });
    })
  );
});

// ✅ ACTIVATE EVENT – Verwijder oude caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`[ServiceWorker] Verwijder oude cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
