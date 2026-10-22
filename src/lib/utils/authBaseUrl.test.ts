import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAuthBaseUrl } from './authBaseUrl';

describe('getAuthBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is same-origin when /auth is proxied', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_PROXY', 'true');
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.test');

    expect(getAuthBaseUrl()).toBe('');
  });

  it('uses the backend URL when /auth is not proxied', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_PROXY', 'false');
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.test');

    expect(getAuthBaseUrl()).toBe('https://api.test');
  });

  it('uses the backend URL when the proxy flag is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_PROXY', undefined);
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.test');

    expect(getAuthBaseUrl()).toBe('https://api.test');
  });
});
