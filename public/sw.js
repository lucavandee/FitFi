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
  // Add other critical assets
];

// Routes to cache dynamically
const DYNAMIC_ROUTES = [
  '/onboarding',
  '/questionnaire',
  '/recommendations',
  '/dashboard'
];

// External domains to cache (like Pexels images)
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
  
  // Force the waiting service worker to become the active service worker
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleFetchRequest(request, url)
  );
});

async function handleFetchRequest(request, url) {
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First for API calls and dynamic content
    if (isApiRequest(url) || isDynamicRoute(url)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for images
    if (isImageRequest(url)) {
      return await staleWhileRevalidate(request);
    }
    
    // Strategy 4: Network First with cache fallback for everything else
    return await networkFirst(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflineFallback();
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return network error
    return new Response('Network error', { 
      status: 408,
      statusText: 'Network error' 
    });
  }
}

// Cache strategies
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Silently fail for background updates
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise;
    return cachedResponse;
  }
  
  // Wait for network if no cached version
  return await fetchPromise || new Response('Image not available', { 
    status: 404 
  });
}

async function getOfflineFallback() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match('/');
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return a basic offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>FitFi - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            text-align: center; 
            padding: 2rem;
            background: #f9fafb;
            color: #374151;
          }
          .container { 
            max-width: 400px; 
            margin: 0 auto; 
            padding: 2rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .logo { 
            font-size: 2rem; 
            font-weight: bold; 
            color: #f97316; 
            margin-bottom: 1rem;
          }
          .message {
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }
          .retry-btn {
            background: #f97316;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }
          .retry-btn:hover {
            background: #ea580c;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">FitFi</div>
          <div class="message">
            <h2>You're offline</h2>
            <p>Please check your internet connection and try again.</p>
          </div>
          <button class="retry-btn" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('/assets/') || 
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname === '/manifest.json';
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('api.');
}

function isDynamicRoute(url) {
  return DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route));
}

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
         EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('[SW] Performing background sync...');
  
  // Example: Send queued form submissions, sync user data, etc.
  try {
    // Implementation would depend on your specific needs
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New style recommendations available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Recommendations',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('FitFi', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/recommendations')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('[SW] Service worker script loaded');