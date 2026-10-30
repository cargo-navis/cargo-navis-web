const SCRIPT_URL = '/driver-sw.js';
// Scoped to /driver so it never takes dashboard pages away from the push service worker at /.
const SCOPE = '/driver';

export function registerDriverServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register(SCRIPT_URL, { scope: SCOPE }).catch((error) => {
    console.error('Driver service worker registration failed', error);
  });
}

/** The /driver registration once its worker is active. Registering again is a no-op when it already exists. */
export async function getActiveDriverServiceWorker() {
  await navigator.serviceWorker.register(SCRIPT_URL, { scope: SCOPE });
  // ready resolves with the registration matching this page (the /driver one) as soon as it has an active worker.
  return navigator.serviceWorker.ready;
}
