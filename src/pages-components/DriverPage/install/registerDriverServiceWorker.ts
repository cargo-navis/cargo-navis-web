/** Scoped to /driver so it never takes dashboard pages away from the push service worker at /. */
export function registerDriverServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/driver-sw.js', { scope: '/driver' }).catch((error) => {
    console.error('Driver service worker registration failed', error);
  });
}
