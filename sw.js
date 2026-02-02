
const CACHE_NAME = 'chessmatch-v2';

// Only cache essential files explicitly to avoid errors
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json?v=2'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use ./ for relative paths if supported, otherwise fallback might be needed but usually for PWA ./index.html is safe
      return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignore unsupported schemes (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
      return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            try {
               cache.put(event.request, responseToCache);
            } catch (err) {
               // Ignore errors
            }
        });

        return response;
      }).catch(() => {
         // Offline fallback could go here
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
    })
  );
  self.clients.claim();
});
