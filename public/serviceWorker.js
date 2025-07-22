// ✅ Service Worker voor FitFi PWA

const CACHE_NAME = 'fitfi-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Helper function to check if URL is a JS/CSS asset
function isAsset(url) {
  return /\.(js|css|map)(\?|$)/.test(url) || url.includes('/assets/');
}

// Helper function to validate response content type
function isValidResponse(response, expectedType) {
  const contentType = response.headers.get('content-type') || '';
  
  if (expectedType === 'javascript') {
    return contentType.includes('javascript') || contentType.includes('application/js');
  }
  if (expectedType === 'css') {
    return contentType.includes('css');
  }
  
  return true;
}

// ✅ INSTALL EVENT – Cache statische assets
self.addEventListener('install', event => {
  try {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Cache geopend');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('[ServiceWorker] Cache addAll failed:', err);
          // Continue without caching if some assets fail
          return Promise.resolve();
        });
      })
    );
  } catch (err) {
    console.error('[ServiceWorker] Install event failed:', err);
  }
});

// ✅ FETCH EVENT – Serve from cache, fallback naar netwerk, en cache nieuwe HTTP-verzoeken
self.addEventListener('fetch', event => {
  try {
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
      return;
    }
    
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
          
          // Extra validation for JS/CSS assets
          const url = event.request.url;
          if (isAsset(url)) {
            const expectedType = url.endsWith('.js') ? 'javascript' : 
                               url.endsWith('.css') ? 'css' : null;
            
            if (expectedType && !isValidResponse(networkResponse, expectedType)) {
              console.error(`[ServiceWorker] Invalid content type for ${url}:`, 
                          networkResponse.headers.get('content-type'));
              // Don't cache invalid responses
              return networkResponse;
            }
          }

          // Clone de response voor caching
          const responseToCache = networkResponse.clone();

          // ✅ Alleen HTTP(S) GET requests cachen, GEEN chrome-extension://
          if (
            event.request.url.startsWith('http') &&
            !event.request.url.includes('/api/') &&
            !isAsset(url) // Don't cache assets that might be served incorrectly
          ) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache).catch(err => {
                console.warn('[ServiceWorker] Cache put failed:', err);
              });
            });
          }

          return networkResponse;
        }).catch(err => {
          console.error('[ServiceWorker] Fetch failed:', err);
          // Return cached version if available, otherwise let it fail
          return caches.match(event.request).then(cached => cached || Promise.reject(err));
        });
      }).catch(err => {
        console.error('[ServiceWorker] Cache match failed:', err);
        // Fallback to network
        return fetch(event.request);
      })
    );
  } catch (err) {
    console.error('[ServiceWorker] Fetch event failed:', err);
    // Let the request go through normally
  }
});

// ✅ ACTIVATE EVENT – Verwijder oude caches
self.addEventListener('activate', event => {
  try {
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
      ).catch(err => {
        console.error('[ServiceWorker] Cache cleanup failed:', err);
        return Promise.resolve();
      })
    );
  } catch (err) {
    console.error('[ServiceWorker] Activate event failed:', err);
  }
});

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('[ServiceWorker] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Error handling for general errors
self.addEventListener('error', event => {
  console.error('[ServiceWorker] Error:', event.error);
});
