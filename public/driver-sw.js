/**
 * Service worker for the driver portal, registered with scope /driver (see registerDriverServiceWorker.ts).
 *
 * It does two things:
 *
 * - Offline page: when the phone has no connection and the driver opens or reloads a /driver page, it shows
 *   /driver-offline.html instead of the browser's error page. Every other request (API calls, scripts, images) is
 *   left alone and goes to the network as usual. Chrome also requires a service worker with a fetch handler before
 *   it offers to install the app.
 * - Push notifications: shows a notification when the backend sends one (e.g. new stops assigned) and opens the
 *   order when the driver taps it. The driver portal subscribes through this worker (usePushNotifications.ts), so
 *   pushes for drivers arrive here, not in the dashboard's push service worker.
 *
 * When driver-offline.html changes, bump OFFLINE_PAGE_CACHE_VERSION so installed apps download the new copy.
 */
// The only cache this worker keeps: a copy of the offline page.
const OFFLINE_PAGE_CACHE_PREFIX = 'driver-offline-';
const OFFLINE_PAGE_CACHE_VERSION = 'v1';
const OFFLINE_PAGE_CACHE_NAME = `${OFFLINE_PAGE_CACHE_PREFIX}${OFFLINE_PAGE_CACHE_VERSION}`;
const OFFLINE_PAGE_URL = '/driver-offline.html';

// 1. Install: runs once for every new version of this file. Download the offline page and keep it in its cache.
self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflinePage());
  // Take over right away instead of waiting until every tab running the previous version is closed.
  self.skipWaiting();
});

// 2. Activate: the new version is now in charge. Delete offline page caches left by older versions, then start handling
//    requests for pages that are already open.
self.addEventListener('activate', (event) => {
  event.waitUntil(deleteOldOfflinePageCaches().then(() => self.clients.claim()));
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
  const offlinePageCache = await caches.open(OFFLINE_PAGE_CACHE_NAME);
  await offlinePageCache.add(OFFLINE_PAGE_URL);
}

async function deleteOldOfflinePageCaches() {
  const cacheNames = await caches.keys();
  const oldCacheNames = cacheNames.filter(
    (name) => name.startsWith(OFFLINE_PAGE_CACHE_PREFIX) && name !== OFFLINE_PAGE_CACHE_NAME
  );
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

// ---------------------------------------------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------------------------------------------

// Messages to open driver portal pages; the page listens for them in useServiceWorkerMessages.ts.
const MESSAGE_STOPS_CHANGED = 'driver-stops-changed';
const MESSAGE_OPEN_SHIPMENT = 'driver-open-shipment';

// 4. Push: the backend sent a notification. A notification must be shown for every push (iOS cancels the
//    subscription otherwise), even when the app is open; an open app also reloads its stops.
self.addEventListener('push', (event) => {
  let payload;
  try {
    payload = event.data.json();
  } catch (error) {
    console.error('[driver-sw] Unreadable push payload', error);
    return;
  }

  const notification = getNotification(payload);
  if (!notification) return;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notification.title, notification.options),
      postToDriverPages({ type: MESSAGE_STOPS_CHANGED }),
    ])
  );
});

// 5. Notification click: open the order. An open app is brought to the front and told which order to show;
//    otherwise the app (or a browser tab) opens on it.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(openShipment(event.notification.data?.shipmentId));
});

function getNotification(payload) {
  switch (payload?.type) {
    case 'vehicle_stops_assigned':
      return getStopsAssignedNotification(payload.metadata);
    default:
      console.warn('[driver-sw] Unsupported push type', payload?.type);
      return null;
  }
}

function getStopsAssignedNotification({ shipmentId, orderNumber, stopCount }) {
  return {
    title: 'Dodijeljene nove postaje',
    options: {
      body: `${getStopsAssignedText(stopCount)} za nalog ${orderNumber}.`,
      icon: '/android-chrome-192x192.png',
      // One notification per order: a later assignment for the same order replaces the earlier one.
      tag: `shipment-${shipmentId}`,
      renotify: true,
      data: { shipmentId },
    },
  };
}

// Croatian plural: 1, 21, 31… nova postaja; 2–4, 22–24… nove postaje; everything else novih postaja.
function getStopsAssignedText(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `Dodijeljena ti je ${count} nova postaja`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `Dodijeljene su ti ${count} nove postaje`;
  }
  return `Dodijeljeno ti je ${count} novih postaja`;
}

async function getDriverPages() {
  // includeUncontrolled: a page opened before this worker took over still counts. Dashboard tabs share the
  // origin, so only /driver pages are kept.
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  return windows.filter((client) => new URL(client.url).pathname.startsWith('/driver'));
}

async function postToDriverPages(message) {
  const pages = await getDriverPages();
  pages.forEach((page) => page.postMessage(message));
}

async function openShipment(shipmentId) {
  const [page] = await getDriverPages();

  if (page) {
    await page.focus();
    if (shipmentId) page.postMessage({ type: MESSAGE_OPEN_SHIPMENT, shipmentId });
    return;
  }

  const url = shipmentId ? `/driver?shipmentId=${encodeURIComponent(shipmentId)}` : '/driver';
  await self.clients.openWindow(url);
}
