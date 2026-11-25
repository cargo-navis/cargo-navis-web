import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearServiceWorkerOnLogout, unsubscribePushOnLogout } from './session';

function stubBrowser(serviceWorker?: object, { push = true } = {}) {
  vi.stubGlobal('navigator', serviceWorker ? { serviceWorker } : {});
  vi.stubGlobal('window', push ? { PushManager: class {} } : {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('unsubscribePushOnLogout', () => {
  it('unsubscribes the current push subscription', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const unsubscribe = vi.fn().mockResolvedValue(true);
    stubBrowser({
      getRegistration: async () => ({ pushManager: { getSubscription: async () => ({ unsubscribe }) } }),
    });

    await unsubscribePushOnLogout();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('settles without a registration or subscription', async () => {
    stubBrowser({ getRegistration: async () => undefined });
    await expect(unsubscribePushOnLogout()).resolves.toBeUndefined();

    stubBrowser({ getRegistration: async () => ({ pushManager: { getSubscription: async () => null } }) });
    await expect(unsubscribePushOnLogout()).resolves.toBeUndefined();
  });

  it('does nothing without service worker or push support', async () => {
    const getRegistration = vi.fn();
    stubBrowser({ getRegistration }, { push: false });
    await unsubscribePushOnLogout();
    expect(getRegistration).not.toHaveBeenCalled();

    stubBrowser();
    await expect(unsubscribePushOnLogout()).resolves.toBeUndefined();
  });

  it('logs instead of throwing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubBrowser({ getRegistration: () => Promise.reject(new Error('blocked')) });

    await expect(unsubscribePushOnLogout()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe('clearServiceWorkerOnLogout', () => {
  it('unregisters every service worker', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const registrations = [{ unregister: vi.fn() }, { unregister: vi.fn() }];
    stubBrowser({ getRegistrations: async () => registrations });

    await clearServiceWorkerOnLogout();

    for (const registration of registrations) expect(registration.unregister).toHaveBeenCalledOnce();
  });

  it('does nothing without service worker support', async () => {
    stubBrowser();
    await expect(clearServiceWorkerOnLogout()).resolves.toBeUndefined();
  });

  it('logs instead of throwing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    stubBrowser({ getRegistrations: () => Promise.reject(new Error('blocked')) });

    await expect(clearServiceWorkerOnLogout()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledOnce();
  });
});
