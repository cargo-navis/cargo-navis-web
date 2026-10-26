// Driver portal service worker, registered with scope /driver. It only serves an offline page for
// navigations; everything else goes to the network untouched. Chrome needs a fetch handler to offer install.
const CACHE_NAME = 'driver-offline-v1';
const OFFLINE_URL = '/driver-offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('driver-offline-') && key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;

  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
