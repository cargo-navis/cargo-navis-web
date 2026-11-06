// Refresh a little before the real expiry, so the token can't run out between this check and the backend reading it.
const EXPIRY_MARGIN_MS = 30 * 1000;

function decodeBase64Url(value: string) {
  const base64 = (value + '='.repeat((4 - (value.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

/**
 * True when the access token (a JWT) is expired or about to expire, judged by its `exp` claim. The client only reads
 * the claim to decide when to refresh; the backend still verifies the token. False when the token can't be read, which
 * leaves it to the 401 handling.
 */
export function isAccessTokenExpiring(token: string, now = Date.now()): boolean {
  const payload = token.split('.')[1];
  if (!payload) return false;

  try {
    const { exp } = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
    return typeof exp === 'number' && exp * 1000 - now < EXPIRY_MARGIN_MS;
  } catch {
    return false;
  }
}
