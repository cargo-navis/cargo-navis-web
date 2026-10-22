/**
 * Base URL for `/auth/*` calls, which carry the httpOnly refresh cookie. Local dev and Vercel previews are
 * cross-site with the API, so there `AUTH_PROXY_TARGET` is set: next.config.mjs proxies `/auth/*` same-origin
 * and sets NEXT_PUBLIC_AUTH_PROXY. Otherwise auth calls go straight to the API.
 */
export function getAuthBaseUrl(): string {
  return process.env.NEXT_PUBLIC_AUTH_PROXY === 'true' ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL ?? '');
}
