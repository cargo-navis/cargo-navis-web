import { backend } from '../services/backendService';

export async function getPushSubscriptions() {
  return backend.get<PushSubscription[]>(`/api/push-subscriptions`);
}

export async function createPushSubscription(subscription: PushSubscription) {
  return backend.post('/api/push-subscriptions', {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
    auth: arrayBufferToBase64(subscription.getKey('auth')),
  });
}

// Utility to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return '';

  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
