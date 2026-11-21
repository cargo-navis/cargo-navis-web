import { useEffect } from 'react';

import { createPushSubscription } from '../api';
import { usePushSubscriptions } from './api/push-subscriptions';

// Postavke › Moj račun › Ovaj uređaj can turn push off for this browser; the dashboard then stops re-subscribing.
const OPT_OUT_KEY = 'cn:push-opt-out';

export function isPushOptedOut() {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPushOptedOut(optedOut: boolean) {
  try {
    if (optedOut) window.localStorage.setItem(OPT_OUT_KEY, 'true');
    else window.localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // Blocked storage: the setting just doesn't stick.
  }
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  );
}

/**
 * Registers the dashboard service worker, asks for notification permission and subscribes this browser to web push
 * (skips the backend POST when the endpoint is already registered for the user). Returns whether push is on.
 */
export async function registerPushSubscription(registered?: { endpoint: string }[]) {
  if (!isPushSupported()) return false;
  try {
    // Register service worker
    await navigator.serviceWorker.register('/cargo-navis_push-service-worker.js');

    // pushManager.subscribe() requires an *active* service worker —
    // register() resolves before activation, so wait for ready.
    const activeRegistration = await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Permission denied');
      return false;
    }

    // Subscribe to push notifications
    const subscription = await activeRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // pushManager.subscribe() is idempotent in the browser, but the
    // backend POST is not — skip it when this endpoint is already
    // registered for the current user.
    const alreadyRegistered = registered?.some((s) => s.endpoint === subscription.endpoint);
    if (alreadyRegistered) return true;

    await createPushSubscription(subscription);
    console.info('Push subscription created');
    return true;
  } catch (error) {
    console.error('Push registration failed:', error);
    return false;
  }
}

export function usePushNotificationSubscription() {
  const { data: pushSubscriptions, isLoading } = usePushSubscriptions();

  useEffect(() => {
    if (!isLoading && !isPushOptedOut()) {
      void registerPushSubscription(pushSubscriptions);
    }
  }, [isLoading, pushSubscriptions]);
}
