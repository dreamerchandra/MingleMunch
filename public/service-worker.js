// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('cache-v2').then((cache) => {
      return cache.addAll([
        '/manifest.json',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (existingCacheName) {
          if (['cache-v1', 'image-cache-v1'].includes(existingCacheName)) {
            // Delete old caches during activation
            return caches.delete(existingCacheName);
          }
        })
      );
    })
  );
});
