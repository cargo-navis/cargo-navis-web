/**
 * Base URL for every backend call (`/api/*` and `/auth/*`). When `BACKEND_PROXY_TARGET` is set (local dev, Vercel
 * previews), next.config.mjs sets NEXT_PUBLIC_BACKEND_PROXY and src/middleware.ts proxies both prefixes, so calls
 * stay same-origin: the httpOnly refresh cookie works and there is no CORS, whether the app is opened on
 * localhost or through a tunnel. Otherwise calls go straight to NEXT_PUBLIC_BACKEND_URL.
 */
export function getBackendBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_PROXY === 'true') {
    return '';
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Missing NEXT_PUBLIC_BACKEND_URL env var.');
  }
  return backendUrl;
}
