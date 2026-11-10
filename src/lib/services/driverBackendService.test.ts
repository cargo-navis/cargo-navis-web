import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { createDriverBackendService, DriverLinkExpiredError, isDriverLinkExpiredError } from './driverBackendService';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

function respond(config: InternalAxiosRequestConfig, status: number, data?: unknown): AxiosResponse {
  const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status ${status}`, String(status), config, null, response);
  }
  return response;
}

function createAdapter(handler: Handler) {
  return vi.fn(async (config: InternalAxiosRequestConfig) => {
    const { status, data } = handler(config);
    return respond(config, status, data);
  });
}

const isExchange = (config: InternalAxiosRequestConfig) => config.url === '/auth/exchange';
const isRefresh = (config: InternalAxiosRequestConfig) => config.url === '/auth/refresh';
// Same shape as the real POST /auth/exchange and /auth/refresh responses (API envelope).
const exchanged = (accessToken: string) => ({ data: { accessToken }, status: 'success' });
const bearer = (config: InternalAxiosRequestConfig) => config.headers?.Authorization;

describe('driverBackendService', () => {
  it('startSession exchanges link token and sends JWT as bearer on later requests', async () => {
    const adapter = createAdapter((config) =>
      isExchange(config) ? { status: 200, data: exchanged('jwt-1') } : { status: 200, data: { data: [] } }
    );
    const service = createDriverBackendService({ adapter });

    await service.startSession('link-1');
    await service.get('/api/driver/stops');

    const [exchangeConfig] = adapter.mock.calls[0];
    const [stopsConfig] = adapter.mock.calls[1];
    expect(exchangeConfig.method).toBe('post');
    expect(JSON.parse(exchangeConfig.data)).toEqual({ token: 'link-1' });
    expect(bearer(exchangeConfig)).toBeUndefined();
    expect(bearer(stopsConfig)).toBe('Bearer jwt-1');
  });

  it('startSession throws DriverLinkExpiredError when exchange returns 410', async () => {
    const service = createDriverBackendService({ adapter: createAdapter(() => ({ status: 410 })) });

    await expect(service.startSession('link-1')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  it('startSession rethrows non-4xx exchange errors', async () => {
    const service = createDriverBackendService({ adapter: createAdapter(() => ({ status: 500 })) });

    const error = await service.startSession('link-1').catch((e) => e);
    expect(error).toBeInstanceOf(AxiosError);
    expect(isDriverLinkExpiredError(error)).toBe(false);
  });

  it('unwraps data envelope', async () => {
    const adapter = createAdapter((config) =>
      isExchange(config) ? { status: 200, data: exchanged('jwt-1') } : { status: 200, data: { data: [1] } }
    );
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).resolves.toEqual([1]);
  });

  it('rejects when the exchange response has no access token', async () => {
    const adapter = createAdapter((config) =>
      isExchange(config) ? { status: 200, data: { data: {}, status: 'success' } } : { status: 200, data: { data: [] } }
    );
    const service = createDriverBackendService({ adapter });

    await expect(service.startSession('link-1')).rejects.toThrow('missing access token');
  });

  it('exchange and refresh are sent with credentials', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 410 };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-refreshed') };
      return { status: 200, data: { data: [] } };
    });
    const service = createDriverBackendService({ adapter });

    await service.startSession('link-1');

    const [exchangeConfig, refreshConfig] = adapter.mock.calls.map(([config]) => config);
    expect(isExchange(exchangeConfig) && exchangeConfig.withCredentials).toBe(true);
    expect(isRefresh(refreshConfig) && refreshConfig.withCredentials).toBe(true);
  });

  it('startSession exchanges the link before trying refresh', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-link') };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-refreshed') };
      return { status: 200, data: { data: [] } };
    });
    const service = createDriverBackendService({ adapter });

    await service.startSession('link-1');
    await service.get('/api/driver/stops');

    const configs = adapter.mock.calls.map(([config]) => config);
    expect(configs.some(isRefresh)).toBe(false);
    expect(bearer(configs[configs.length - 1])).toBe('Bearer jwt-link');
  });

  it('startSession falls back to refresh when the link is expired', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 410 };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-refreshed') };
      return { status: 200, data: { data: [] } };
    });
    const service = createDriverBackendService({ adapter });

    await service.startSession('old-link');
    await service.get('/api/driver/stops');

    const lastConfig = adapter.mock.calls[adapter.mock.calls.length - 1][0];
    expect(bearer(lastConfig)).toBe('Bearer jwt-refreshed');
  });

  it('startSession throws DriverLinkExpiredError when link and refresh both fail', async () => {
    const adapter = createAdapter((config) => (isExchange(config) ? { status: 410 } : { status: 401 }));
    const service = createDriverBackendService({ adapter });

    await expect(service.startSession('old-link')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  it('startSession(null) restores the session through refresh', async () => {
    const adapter = createAdapter((config) =>
      isRefresh(config) ? { status: 200, data: exchanged('jwt-refreshed') } : { status: 200, data: { data: [] } }
    );
    const service = createDriverBackendService({ adapter });

    await service.startSession(null);
    await service.get('/api/driver/stops');

    const configs = adapter.mock.calls.map(([config]) => config);
    expect(configs.some(isExchange)).toBe(false);
    expect(bearer(configs[configs.length - 1])).toBe('Bearer jwt-refreshed');
  });

  it('startSession(null) throws DriverLinkExpiredError when refresh returns 401', async () => {
    const service = createDriverBackendService({ adapter: createAdapter(() => ({ status: 401 })) });

    await expect(service.startSession(null)).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  it('startSession(null) rethrows a 500 from refresh', async () => {
    const service = createDriverBackendService({ adapter: createAdapter(() => ({ status: 500 })) });

    const error = await service.startSession(null).catch((e) => e);
    expect(error).toBeInstanceOf(AxiosError);
    expect(isDriverLinkExpiredError(error)).toBe(false);
  });

  it('refreshes once on 401 and retries', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-1') };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-2') };
      return bearer(config) === 'Bearer jwt-1' ? { status: 401 } : { status: 200, data: { data: 'ok' } };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).resolves.toBe('ok');

    const configs = adapter.mock.calls.map(([config]) => config);
    expect(configs.filter(isRefresh)).toHaveLength(1);
    expect(configs.filter(isExchange)).toHaveLength(1);
    expect(bearer(configs[configs.length - 1])).toBe('Bearer jwt-2');
  });

  it('shares one refresh between parallel 401s', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-1') };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-2') };
      return bearer(config) === 'Bearer jwt-1' ? { status: 401 } : { status: 200, data: { data: 'ok' } };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await Promise.all([service.get('/api/driver/stops'), service.get('/api/account')]);

    expect(adapter.mock.calls.map(([config]) => config).filter(isRefresh)).toHaveLength(1);
  });

  it('throws DriverLinkExpiredError when the retried request is 401 again', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-1') };
      if (isRefresh(config)) return { status: 200, data: exchanged('jwt-2') };
      return { status: 401 };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  it('throws DriverLinkExpiredError when refresh after a 401 is rejected', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-1') };
      return { status: 401 };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  // When refresh is rejected (e.g. no cookie yet), a still-valid link keeps the session alive as before.
  it('re-exchanges the link when refresh after a 401 is rejected', async () => {
    let exchanges = 0;
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged(`jwt-${++exchanges}`) };
      if (isRefresh(config)) return { status: 401 };
      return bearer(config) === 'Bearer jwt-1' ? { status: 401 } : { status: 200, data: { data: 'ok' } };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).resolves.toBe('ok');
    expect(exchanges).toBe(2);
  });

  it('keeps the session state when refresh after a 401 fails with 500', async () => {
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: exchanged('jwt-1') };
      if (isRefresh(config)) return { status: 500 };
      return { status: 401 };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    const error = await service.get('/api/driver/stops').catch((e) => e);
    expect(error).toBeInstanceOf(AxiosError);
    expect(isDriverLinkExpiredError(error)).toBe(false);
  });
});
