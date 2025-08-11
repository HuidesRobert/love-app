const CACHE_NAME = 'app-cache-v1';

const CORE_ASSETS = [
  '/', // cache root as well
  '/index.html',
  '/category.html',
  '/style.css',
  '/script.js',
  '/sw-register.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // add more core files you want cached upfront here
];

// Install event - precache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event - respond with cached or fetch & cache dynamically
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Serve cached response if available
        return cachedResponse;
      }
      // Else fetch from network and cache dynamically
      return fetch(event.request).then(networkResponse => {
        // Only cache valid responses
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Optional: fallback to offline page or image if you want
      });
    })
  );
});
