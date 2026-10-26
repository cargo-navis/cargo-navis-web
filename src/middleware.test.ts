import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { middleware } from './middleware';

function authRequest() {
  return new NextRequest('http://localhost:3000/auth/refresh?x=1', {
    method: 'POST',
    headers: { origin: 'https://tunnel.ngrok-free.app', cookie: 'refresh=abc' },
  });
}

describe('middleware /auth proxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('proxies /auth/* to BACKEND_PROXY_TARGET', () => {
    vi.stubEnv('BACKEND_PROXY_TARGET', 'https://api.test');

    const response = middleware(authRequest());

    expect(response.headers.get('x-middleware-rewrite')).toBe('https://api.test/auth/refresh?x=1');
  });

  it('drops the Origin header but keeps cookies', () => {
    vi.stubEnv('BACKEND_PROXY_TARGET', 'https://api.test');

    const response = middleware(authRequest());

    const forwarded = response.headers.get('x-middleware-override-headers')?.split(',') ?? [];
    expect(forwarded).not.toContain('origin');
    expect(forwarded).toContain('cookie');
  });

  it('does not proxy without BACKEND_PROXY_TARGET', () => {
    vi.stubEnv('BACKEND_PROXY_TARGET', undefined);

    const response = middleware(authRequest());

    expect(response.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('proxies /api/* to BACKEND_PROXY_TARGET without the Origin header', () => {
    vi.stubEnv('BACKEND_PROXY_TARGET', 'http://localhost:80');
    const request = new NextRequest('https://tunnel.ngrok-free.app/api/driver/stops?completedWithinDays=7', {
      headers: { origin: 'https://tunnel.ngrok-free.app', authorization: 'Bearer jwt' },
    });

    const response = middleware(request);

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'http://localhost/api/driver/stops?completedWithinDays=7'
    );
    const forwarded = response.headers.get('x-middleware-override-headers')?.split(',') ?? [];
    expect(forwarded).not.toContain('origin');
    expect(forwarded).toContain('authorization');
  });
});
