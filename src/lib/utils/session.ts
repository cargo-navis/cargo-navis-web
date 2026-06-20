import { deleteCookie, readCookie, setCookie } from './cookies';

export const ACCESS_TOKEN_KEY = 'access-token';
// export const REFRESH_TOKEN_KEY ='refresh-token';

interface AuthTokens {
  accessToken: string | undefined;
  // refreshToken: string | undefined;
}

export function getAuthTokens(): AuthTokens {
  return {
    accessToken: readCookie(ACCESS_TOKEN_KEY),
    // refreshToken: readCookie(REFRESH_TOKEN_KEY),
  };
}

export function setAuthTokens({ accessToken }: AuthTokens) {
  setCookie(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });
  // setCookie(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
}

export function clearAuthCookies() {
  deleteCookie(ACCESS_TOKEN_KEY);
  // deleteCookie(REFRESH_TOKEN_KEY);
}

export async function unsubscribePushOnLogout() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // unsubscribe() invalidates the endpoint so the push service rejects
      // any further pushes to this device — notifications stop on logout.
      if (subscription) {
        await subscription.unsubscribe();
        console.info('Push subscription unsubscribed on signout');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }
}

export async function clearServiceWorkerOnLogout() {
  if ('serviceWorker' in navigator) {
    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();

      // Unregister all service workers
      for (const registration of registrations) {
        await registration.unregister();
        console.info('Service worker unregistered on signout');
      }
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
    }
  }
}
