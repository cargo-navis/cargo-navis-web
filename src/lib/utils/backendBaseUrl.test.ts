import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBackendBaseUrl } from './backendBaseUrl';

describe('getBackendBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is same-origin when the backend is proxied', () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_PROXY', 'true');
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.test');

    expect(getBackendBaseUrl()).toBe('');
  });

  it('uses the backend URL when the backend is not proxied', () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_PROXY', 'false');
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'https://api.test');

    expect(getBackendBaseUrl()).toBe('https://api.test');
  });
});
