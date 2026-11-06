import { describe, expect, it } from 'vitest';

import { isAccessTokenExpiring } from './accessTokenExpiry';

const NOW = Date.UTC(2026, 10, 2, 12, 0, 0);

function jwt(payload: object) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

const expIn = (seconds: number) => jwt({ exp: NOW / 1000 + seconds });

describe('isAccessTokenExpiring', () => {
  it('is true for an expired token', () => {
    expect(isAccessTokenExpiring(expIn(-1), NOW)).toBe(true);
  });

  it('is true within the last 30 seconds', () => {
    expect(isAccessTokenExpiring(expIn(29), NOW)).toBe(true);
  });

  it('is false for a token with time left', () => {
    expect(isAccessTokenExpiring(expIn(31), NOW)).toBe(false);
  });

  it('is false when the token is not a readable JWT', () => {
    expect(isAccessTokenExpiring('not-a-jwt', NOW)).toBe(false);
    expect(isAccessTokenExpiring('a.%%%.c', NOW)).toBe(false);
    expect(isAccessTokenExpiring(jwt({ sub: 'user' }), NOW)).toBe(false);
  });
});
