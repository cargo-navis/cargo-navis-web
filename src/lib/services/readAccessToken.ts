/**
 * Reads the access token from an /auth/exchange or /auth/refresh response, which use the API envelope:
 * { data: { accessToken }, status: 'success' }. Fails loudly; a silent undefined would send every later
 * request without a token.
 */
export function readAccessToken(body: { data?: { accessToken?: string }; status?: string } | undefined): string {
  const accessToken = body?.data?.accessToken;
  if (!accessToken) {
    throw new Error('Auth response: missing access token');
  }
  return accessToken;
}
