// Service Worker for FitFi

const CACHE_NAME = 'fitfi-v1.0.0';
const STATIC_CACHE_NAME = 'fitfi-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'fitfi-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  // Add other critical assets here
];

// Routes to cache dynamically
const DYNAMIC_ROUTES = [
  '/onboarding',
  '/questionnaire',
  '/recommendations',
  '/dashboard'
];

// External domains to cache (e.g., Pexels images)
const EXTERNAL_DOMAINS = [
  'images.pexels.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
  // Activate new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - route requests through cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Only handle GET over HTTP(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }
  event.respondWith(handleFetchRequest(request, url));
});

async function handleFetchRequest(request, url) {
  try {
    // Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    // Network First for API and dynamic routes
    if (isApiRequest(url) || isDynamicRoute(url)) {
      return await networkFirst(request);
    }
    // Stale While Revalidate for images
    if (isImageRequest(url)) {
      return await staleWhileRevalidate(request);
    }
    // Default: Network First
    return await networkFirst(request);
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    // Offline fallback for navigations
    if (request.mode === 'navigate') {
      return await getOfflineFallback();
    }
    // Return any cached fallback
    const cached = await caches.match(request);
    return cached || new Response('Network error', { status: 408 });
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((resp) => {
      if (resp.ok) cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => null);
  return cached || (await networkPromise) || new Response('Not found', { status: 404 });
}

// Offline fallback page
async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match('/');
  if (cached) return cached;
  return new Response(`
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Offline</title></head>
    <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
      <h1>FitFi Offline</h1>
      <p>Controleer je internetverbinding en probeer het opnieuw.</p>
      <button onclick="location.reload()">Opnieuw laden</button>
    </body></html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

// Helper checks
function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/') ||
         ['.css', '.js', '.woff', '.woff2'].some(ext => url.pathname.endsWith(ext)) ||
         url.pathname === '/manifest.json';
}
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.hostname.includes('api.');
}
function isDynamicRoute(url) {
  return DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route));
}
function isImageRequest(url) {
  return ['jpg','jpeg','png','gif','webp','svg'].some(ext => url.pathname.endsWith(`.${ext}`)) ||
         EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain));
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  // Implement offline queued actions here
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { text: 'Nieuwe aanbevelingen!' };
  const options = {
    body: data.text,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { date: Date.now() }
  };
  event.waitUntil(self.registration.showNotification('FitFi', options));
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.action === 'explore' ? '/recommendations' : '/';
  event.waitUntil(clients.openWindow(url));
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');
