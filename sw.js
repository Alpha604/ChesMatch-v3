
const CACHE_NAME = 'chessmatch-v1';

// Only cache local files during install to avoid CORS errors with CDNs
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
          return response;
        }

        // Cache the fetched resource (runtime caching)
        // This handles Tailwind and FontAwesome when they are loaded by the page
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            // We use put here which is more permissive than addAll
            try {
               cache.put(event.request, responseToCache);
            } catch (err) {
               // Ignore errors (e.g. chrome-extension:// schemes)
            }
        });

        return response;
      }).catch(() => {
        // Optional: Return a fallback offline page if needed
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
  self.clients.claim(); // Take control of all clients immediately
});
