import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

function setup(
  handler: Handler,
  {
    initialToken = 'old',
    withRefreshLock,
  }: { initialToken?: string; withRefreshLock?: <T>(run: () => Promise<T>) => Promise<T> } = {}
) {
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
    refreshBeforeSend: true,
    withRefreshLock,
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

// A JWT whose exp is `secondsFromNow` away (negative = already expired). Only the payload matters to the client.
function jwt(secondsFromNow: number) {
  const payload = { exp: Math.floor(Date.now() / 1000) + secondsFromNow };
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

const order = (configs: InternalAxiosRequestConfig[]) =>
  configs.map((config) => (isRefresh(config) ? 'refresh' : bearer(config)));

describe('backendService', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it('holds requests started during a refresh and sends them with the new token', async () => {
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    let refreshStarted!: () => void;
    const refreshStartedSignal = new Promise<void>((resolve) => {
      refreshStarted = resolve;
    });
    const { service, calls } = setup(async (config) => {
      if (isRefresh(config)) {
        refreshStarted();
        await refreshGate;
      }
      return acceptsNewToken(config);
    });

    // /api/a gets 401 and starts the refresh; /api/b starts while that refresh is still running.
    const first = service.get('/api/a');
    await refreshStartedSignal;
    const second = service.get('/api/b');
    releaseRefresh();

    await expect(Promise.all([first, second])).resolves.toEqual(['ok', 'ok']);
    const sentB = calls().filter((config) => config.url === '/api/b');
    expect(sentB.map(bearer)).toEqual(['Bearer new']);
  });

  describe('before sending', () => {
    it('refreshes an expired token first, so the API only sees the new one', async () => {
      const { service, calls } = setup(acceptsNewToken, { initialToken: jwt(-60) });

      await expect(service.get('/api/x')).resolves.toBe('ok');

      expect(order(calls())).toEqual(['refresh', 'Bearer new']);
    });

    it('refreshes a missing token first', async () => {
      const { service, calls } = setup(acceptsNewToken, { initialToken: '' });

      await expect(service.get('/api/x')).resolves.toBe('ok');

      expect(order(calls())).toEqual(['refresh', 'Bearer new']);
    });

    it('holds parallel requests behind one refresh', async () => {
      const { service, calls, refreshCalls } = setup(acceptsNewToken, { initialToken: jwt(-60) });

      await expect(Promise.all([service.get('/api/a'), service.get('/api/b')])).resolves.toEqual(['ok', 'ok']);

      expect(refreshCalls()).toHaveLength(1);
      expect(
        calls()
          .filter((config) => !isRefresh(config))
          .map(bearer)
      ).toEqual(['Bearer new', 'Bearer new']);
    });

    it('refreshes a token that expires within the next few seconds', async () => {
      const { service, calls } = setup(acceptsNewToken, { initialToken: jwt(5) });

      await service.get('/api/x');

      expect(order(calls())).toEqual(['refresh', 'Bearer new']);
    });

    it('sends a valid token without refreshing', async () => {
      const token = jwt(3600);
      const { service, refreshCalls, calls } = setup(
        (config) => (bearer(config) === `Bearer ${token}` ? { status: 200, data: { data: 'ok' } } : { status: 401 }),
        { initialToken: token }
      );

      await expect(service.get('/api/x')).resolves.toBe('ok');

      expect(refreshCalls()).toHaveLength(0);
      expect(calls()).toHaveLength(1);
    });

    it('expires the session without calling the API when the refresh is rejected', async () => {
      const { service, onSessionExpired, calls } = setup(() => ({ status: 401 }), { initialToken: jwt(-60) });

      await expect(service.get('/api/x')).rejects.toBeInstanceOf(AxiosError);

      expect(onSessionExpired).toHaveBeenCalledWith({ redirect: true });
      expect(calls().filter((config) => !isRefresh(config))).toHaveLength(0);
    });

    it('sends the request anyway when the refresh fails with 500', async () => {
      const { service, onSessionExpired, calls } = setup(
        (config) => (isRefresh(config) ? { status: 500 } : { status: 200, data: { data: 'ok' } }),
        { initialToken: jwt(-60) }
      );

      await expect(service.get('/api/x')).resolves.toBe('ok');

      expect(onSessionExpired).not.toHaveBeenCalled();
      expect(calls().filter((config) => !isRefresh(config))).toHaveLength(1);
    });
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

  it('runs the refresh inside the cross-tab lock', async () => {
    let lockedRuns = 0;
    const withRefreshLock = <T>(run: () => Promise<T>) => {
      lockedRuns += 1;
      return run();
    };
    const { service } = setup(acceptsNewToken, { withRefreshLock });

    await expect(service.get('/api/x')).resolves.toBe('ok');

    expect(lockedRuns).toBe(1);
  });

  it('calls the API same-origin when the backend is proxied', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_PROXY', 'true');
    const { service, calls } = setup(acceptsNewToken);

    await service.get('/api/x');

    expect(calls().map((config) => config.baseURL)).toEqual(['', '', '']);
  });
});
