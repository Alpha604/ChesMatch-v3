
const CACHE_NAME = 'chessmatch-v7';

// Only cache essential local files. External images will be cached by browser disk cache automatically.
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json?v=7'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        // Cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
          return response;
        }
        
        // Clone and cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, responseToCache); } catch (err) {}
        });
        
        return response;
      }).catch(() => {
        // Fallback or nothing
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
