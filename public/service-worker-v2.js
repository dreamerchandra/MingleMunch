const cacheName = 'cache-v2';


// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(['/manifest.json']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (
          response &&
          response?.headers?.get('Content-Type')?.includes('image')
        ) {
          // Cache a copy of the image response for future use
          return caches.open(cacheName).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        } else {
          return response;
        }
      });
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
