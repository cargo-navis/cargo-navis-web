import { useEffect, useState } from 'react';

import { createDriverPushSubscription, getDriverPushSubscriptions } from '@/lib/api/driver';

import { getActiveDriverServiceWorker } from '../install/registerDriverServiceWorker';

/** `unsupported`: this browser can't receive web push, e.g. an iPhone outside the installed app. */
export type DriverPushNotificationsStatus = 'unsupported' | NotificationPermission;

function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// The VAPID public key is base64url; subscribe() wants the raw bytes.
function base64UrlToBytes(value: string) {
  const base64 = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

/** Subscribes this device through the driver service worker and makes sure the backend knows the subscription. */
async function syncPushSubscription() {
  const registration = await getActiveDriverServiceWorker();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    }));

  // The backend stores every POST, so only send a subscription it doesn't have yet.
  const saved = await getDriverPushSubscriptions();
  if (!saved.some(({ endpoint }) => endpoint === subscription.endpoint)) {
    await createDriverPushSubscription(subscription);
  }
}

export function useDriverPushNotifications({ enabled }: { enabled: boolean }) {
  // Starts as 'unsupported' so server and first client render match; the effect reads the real permission.
  const [status, setStatus] = useState<DriverPushNotificationsStatus>('unsupported');

  useEffect(() => {
    if (!enabled || !isPushSupported()) return;

    const { permission } = Notification;
    setStatus(permission);

    // On every app open: the browser can replace a subscription, so the backend gets the current one again.
    if (permission === 'granted') {
      syncPushSubscription().catch((error) => console.error('Push subscription sync failed', error));
    }
  }, [enabled]);

  async function enable() {
    // The first await after the tap: iOS only shows the permission prompt for a direct user action.
    const permission = await Notification.requestPermission();
    // 'granted' only once the backend has the subscription; if saving fails the card stays, so the driver can retry.
    if (permission === 'granted') await syncPushSubscription();
    setStatus(permission);
    return permission;
  }

  return { status, enable };
}
