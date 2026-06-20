import { useEffect } from 'react';

import { createPushSubscription } from '../api';
import { usePushSubscriptions } from './api/push-subscriptions';

export function usePushNotificationSubscription() {
  const { data: pushSubscriptions, isLoading } = usePushSubscriptions();

  useEffect(() => {
    async function registerPush() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
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
            return;
          }

          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicVapidKey) {
            console.error('VAPID_PUBLIC_KEY is not set');
            // TODO - report to Sentry
            return;
          }

          // Subscribe to push notifications
          const subscription = await activeRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey,
          });

          // pushManager.subscribe() is idempotent in the browser, but the
          // backend POST is not — skip it when this endpoint is already
          // registered for the current user.
          const alreadyRegistered = pushSubscriptions?.some((s) => s.endpoint === subscription.endpoint);
          if (alreadyRegistered) return;

          await createPushSubscription(subscription);
          console.info('Push subscription created');
        } catch (error) {
          console.error('Push registration failed:', error);
        }
      }
    }

    if (!isLoading) {
      registerPush();
    }
  }, [isLoading, pushSubscriptions]);
}
