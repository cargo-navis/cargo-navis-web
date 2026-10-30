import { describe, expect, it } from 'vitest';

import { readAccessToken } from './readAccessToken';

describe('readAccessToken', () => {
  it('reads the access token from the API envelope', () => {
    expect(readAccessToken({ data: { accessToken: 'jwt' }, status: 'success' })).toBe('jwt');
  });

  it('throws when the access token is missing', () => {
    expect(() => readAccessToken({ data: {}, status: 'success' })).toThrow('missing access token');
    expect(() => readAccessToken(undefined)).toThrow('missing access token');
  });
});
