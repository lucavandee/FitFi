const CACHE_VERSION = 'fitfi-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const CACHE_STRATEGIES = {
  static: [/\.(js|css|woff2?)$/],
  images: [/\.(png|jpg|jpeg|gif|svg|webp)$/],
  api: [/\/api\//, /supabase\.co/],
};

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('fitfi-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Skip service worker for external CDNs (Google Fonts, Analytics)
  // Let browser handle these directly to avoid CSP conflicts
  if (
    url.origin.includes('googleapis.com') ||
    url.origin.includes('gstatic.com') ||
    url.origin.includes('google-analytics.com') ||
    url.origin.includes('googletagmanager.com') ||
    url.origin.includes('analytics.google.com')
  ) {
    return; // Let browser fetch directly
  }

  if (url.origin.includes('supabase') && request.method === 'POST') {
    return;
  }

  if (CACHE_STRATEGIES.images.some((pattern) => pattern.test(request.url))) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (CACHE_STRATEGIES.static.some((pattern) => pattern.test(request.url))) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (url.pathname.startsWith('/api/') || url.origin.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, data: customData } = data;

    const options = {
      body: body || '',
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: customData || {},
      actions: [
        {
          action: 'open',
          title: 'Bekijken',
        },
        {
          action: 'close',
          title: 'Sluiten',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title || 'FitFi', options));
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outfit-saves') {
    event.waitUntil(syncOutfitSaves());
  }
  if (event.tag === 'sync-preferences') {
    event.waitUntil(syncPreferences());
  }
});

async function syncOutfitSaves() {
  try {
    const cache = await caches.open('pending-actions');
    const requests = await cache.keys();

    const saveRequests = requests.filter((req) => req.url.includes('saved_outfits'));

    for (const request of saveRequests) {
      const response = await fetch(request.clone());
      if (response.ok) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync outfit saves failed:', error);
  }
}

async function syncPreferences() {
  try {
    const cache = await caches.open('pending-actions');
    const requests = await cache.keys();

    const prefRequests = requests.filter((req) =>
      req.url.includes('notification_preferences') || req.url.includes('style_profiles')
    );

    for (const request of prefRequests) {
      const response = await fetch(request.clone());
      if (response.ok) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync preferences failed:', error);
  }
}
