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
const bearer = (config: InternalAxiosRequestConfig) => config.headers?.Authorization;

describe('driverBackendService', () => {
  it('startSession exchanges link token and sends JWT as bearer on later requests', async () => {
    const adapter = createAdapter((config) =>
      isExchange(config) ? { status: 200, data: { accessToken: 'jwt-1' } } : { status: 200, data: { data: [] } }
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
      isExchange(config) ? { status: 200, data: { accessToken: 'jwt-1' } } : { status: 200, data: { data: [1] } }
    );
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).resolves.toEqual([1]);
  });

  it('re-exchanges once on 401 and retries the request', async () => {
    let exchanges = 0;
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: { accessToken: `jwt-${++exchanges}` } };
      return bearer(config) === 'Bearer jwt-1' ? { status: 401 } : { status: 200, data: { data: 'ok' } };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).resolves.toBe('ok');
    const lastConfig = adapter.mock.calls[adapter.mock.calls.length - 1][0];
    expect(bearer(lastConfig)).toBe('Bearer jwt-2');
    expect(exchanges).toBe(2);
  });

  it('parallel 401s share a single exchange call', async () => {
    let exchanges = 0;
    const adapter = createAdapter((config) => {
      if (isExchange(config)) return { status: 200, data: { accessToken: `jwt-${++exchanges}` } };
      return bearer(config) === 'Bearer jwt-1' ? { status: 401 } : { status: 200, data: { data: 'ok' } };
    });
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await Promise.all([service.get('/api/driver/stops'), service.get('/api/account')]);
    expect(exchanges).toBe(2);
  });

  it('rejects with DriverLinkExpiredError when retried request still returns 401', async () => {
    const adapter = createAdapter((config) =>
      isExchange(config) ? { status: 200, data: { accessToken: 'jwt' } } : { status: 401 }
    );
    const service = createDriverBackendService({ adapter });
    await service.startSession('link-1');

    await expect(service.get('/api/driver/stops')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });
});
