/**
 * Service worker for the driver portal, registered with scope /driver (see registerDriverServiceWorker.ts).
 *
 * It does one thing: when the phone has no connection and the driver opens or reloads a /driver page, it shows
 * /driver-offline.html instead of the browser's error page. Every other request (API calls, scripts, images) is
 * left alone and goes to the network as usual.
 *
 * Chrome also requires a service worker with a fetch handler before it offers to install the app.
 *
 * When driver-offline.html changes, bump CACHE_VERSION so installed apps download the new copy.
 */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `driver-offline-${CACHE_VERSION}`;
const OFFLINE_PAGE_URL = '/driver-offline.html';

// 1. Install: runs once for every new version of this file. Download the offline page and keep it in the cache.
self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflinePage());
  // Take over right away instead of waiting until every tab running the previous version is closed.
  self.skipWaiting();
});

// 2. Activate: the new version is now in charge. Delete caches left by older versions, then start handling
//    requests for pages that are already open.
self.addEventListener('activate', (event) => {
  event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

// 3. Fetch: called for every request a /driver page makes.
self.addEventListener('fetch', (event) => {
  // Only handle page loads ("navigations": opening the app, following a link, reloading). For any other request
  // we return without calling respondWith, so the browser fetches it normally.
  const isPageLoad = event.request.mode === 'navigate';
  if (!isPageLoad) return;

  event.respondWith(loadPageOrOfflineFallback(event.request));
});

async function cacheOfflinePage() {
  const cache = await caches.open(CACHE_NAME);
  await cache.add(OFFLINE_PAGE_URL);
}

async function deleteOldCaches() {
  const cacheNames = await caches.keys();
  const oldCacheNames = cacheNames.filter((name) => name.startsWith('driver-offline-') && name !== CACHE_NAME);
  await Promise.all(oldCacheNames.map((name) => caches.delete(name)));
}

// Network first, so the driver always gets the live page. fetch() only throws when there is no connection at all
// (an HTTP error such as 500 still returns a response), and only then is the offline page shown.
async function loadPageOrOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    const offlinePage = await caches.match(OFFLINE_PAGE_URL);
    // The cached copy can be gone if the browser evicted it; fall back to the browser's own error page then.
    return offlinePage ?? Response.error();
  }
}
