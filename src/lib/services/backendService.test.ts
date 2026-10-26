import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { createBackendService } from './backendService';

type HandlerResult = { status: number; data?: unknown };
type Handler = (config: InternalAxiosRequestConfig) => HandlerResult | Promise<HandlerResult>;

function respond(config: InternalAxiosRequestConfig, status: number, data?: unknown): AxiosResponse {
  const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status ${status}`, String(status), config, null, response);
  }
  return response;
}

const isRefresh = (config: InternalAxiosRequestConfig) => !!config.url?.endsWith('/auth/refresh');
const bearer = (config: InternalAxiosRequestConfig) => config.headers?.Authorization;
// Same shape as the real POST /auth/refresh response (API envelope).
const refreshed = (accessToken: string) => ({ data: { accessToken }, status: 'success' });

function setup(handler: Handler, { initialToken = 'old' }: { initialToken?: string } = {}) {
  let accessToken: string | undefined = initialToken || undefined;
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    const { status, data } = await handler(config);
    return respond(config, status, data);
  });
  const setAccessToken = vi.fn((token: string) => {
    accessToken = token;
  });
  const onSessionExpired = vi.fn();
  const service = createBackendService({
    adapter,
    getAccessToken: () => accessToken,
    setAccessToken,
    onSessionExpired,
  });
  const calls = () => adapter.mock.calls.map(([config]) => config);
  const refreshCalls = () => calls().filter(isRefresh);
  return { service, adapter, setAccessToken, onSessionExpired, calls, refreshCalls };
}

// API calls succeed only with the refreshed token.
const acceptsNewToken: Handler = (config) => {
  if (isRefresh(config)) return { status: 200, data: refreshed('new') };
  return bearer(config) === 'Bearer new' ? { status: 200, data: { data: 'ok' } } : { status: 401 };
};

describe('backendService', () => {
  it('refreshes once on 401 and retries with the new token', async () => {
    const { service, setAccessToken, calls } = setup(acceptsNewToken);

    await expect(service.get('/api/x')).resolves.toBe('ok');

    expect(setAccessToken).toHaveBeenCalledWith('new');
    const apiCalls = calls().filter((config) => !isRefresh(config));
    expect(apiCalls.map(bearer)).toEqual(['Bearer old', 'Bearer new']);
  });

  it('sends the refresh request with credentials', async () => {
    const { service, refreshCalls } = setup(acceptsNewToken);

    await service.get('/api/x');

    expect(refreshCalls()).toHaveLength(1);
    expect(refreshCalls()[0].withCredentials).toBe(true);
    expect(refreshCalls()[0].method).toBe('post');
  });

  it('shares one refresh between parallel 401s', async () => {
    const { service, refreshCalls } = setup(acceptsNewToken);

    await expect(Promise.all([service.get('/api/a'), service.get('/api/b')])).resolves.toEqual(['ok', 'ok']);

    expect(refreshCalls()).toHaveLength(1);
  });

  it('expires the session with redirect when refresh returns 401', async () => {
    const { service, onSessionExpired } = setup(() => ({ status: 401 }));

    await expect(service.get('/api/x')).rejects.toBeInstanceOf(AxiosError);

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledWith({ redirect: true });
  });

  it('does not redirect when _ignoreRedirect is set', async () => {
    const { service, onSessionExpired } = setup(() => ({ status: 401 }));

    await expect(service.get('/api/x', { _ignoreRedirect: true } as object)).rejects.toBeInstanceOf(AxiosError);

    expect(onSessionExpired).toHaveBeenCalledWith({ redirect: false });
  });

  it('expires the session when the retried request is 401 again', async () => {
    const { service, onSessionExpired, refreshCalls } = setup((config) =>
      isRefresh(config) ? { status: 200, data: refreshed('new') } : { status: 401 }
    );

    await expect(service.get('/api/x')).rejects.toBeInstanceOf(AxiosError);

    expect(refreshCalls()).toHaveLength(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when refresh fails with 500', async () => {
    const { service, onSessionExpired } = setup((config) => (isRefresh(config) ? { status: 500 } : { status: 401 }));

    await expect(service.get('/api/x')).rejects.toBeInstanceOf(AxiosError);

    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('does not refresh when _doNotRefresh is set', async () => {
    const { service, refreshCalls, onSessionExpired } = setup(acceptsNewToken);

    await expect(service.get('/api/x', { _doNotRefresh: true } as object)).rejects.toBeInstanceOf(AxiosError);

    expect(refreshCalls()).toHaveLength(0);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('retries without refreshing when another request already refreshed the token', async () => {
    let releaseStale!: () => void;
    const staleGate = new Promise<void>((resolve) => {
      releaseStale = resolve;
    });
    const { service, refreshCalls } = setup(async (config) => {
      // /api/b was sent with the old token and only fails after /api/a has refreshed it.
      if (config.url === '/api/b' && bearer(config) === 'Bearer old') {
        await staleGate;
        return { status: 401 };
      }
      return acceptsNewToken(config);
    });

    const stale = service.get('/api/b');
    await expect(service.get('/api/a')).resolves.toBe('ok');
    releaseStale();

    await expect(stale).resolves.toBe('ok');
    expect(refreshCalls()).toHaveLength(1);
  });

  it('refreshes when there is no access token yet', async () => {
    const { service, refreshCalls } = setup(acceptsNewToken, { initialToken: '' });

    await expect(service.get('/api/x')).resolves.toBe('ok');

    expect(refreshCalls()).toHaveLength(1);
  });

  it('keeps the session when the refresh response has no access token', async () => {
    const { service, setAccessToken, onSessionExpired } = setup((config) =>
      isRefresh(config) ? { status: 200, data: { data: {}, status: 'success' } } : { status: 401 }
    );

    await expect(service.get('/api/x')).rejects.toBeInstanceOf(AxiosError);

    expect(setAccessToken).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
