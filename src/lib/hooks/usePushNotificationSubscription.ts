import { useEffect } from 'react';

import { createPushSubscription } from '../api';

export function usePushNotificationSubscription(tenantId: string) {
  // TODO: "tenantId" is not consumed

  useEffect(() => {
    async function registerPush() {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // Register service worker
          const serviceWorkerRegistration = await navigator.serviceWorker.register(
            './cargo-navis_push-service-worker.js'
          );

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
          const subscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicVapidKey,
          });

          await createPushSubscription(subscription);
          console.info('Push subscription created');
        } catch (error) {
          console.error('Push registration failed:', error);
        }
      }
    }

    registerPush();
  }, [tenantId]);
}
