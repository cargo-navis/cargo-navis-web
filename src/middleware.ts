// middleware.ts (at the root of your project)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Dev-only backend proxy, active when BACKEND_PROXY_TARGET is set (local dev, Vercel previews). The client then
 * calls /auth/* and /api/* on this app (see getBackendBaseUrl), and they are forwarded to the backend: the httpOnly
 * refresh cookie only works same-origin, and no CORS is involved, whether the app runs on localhost or behind a
 * tunnel such as ngrok (the backend itself is not tunnelled; the proxy reaches it directly).
 * The Origin header is dropped because the API's CORS check rejects origins it does not know, such as this app's
 * ngrok or Vercel preview URL, with 403; to the browser these are same-origin calls anyway.
 */
function proxyToBackend(request: NextRequest) {
  const backendProxyTarget = process.env.BACKEND_PROXY_TARGET;
  if (!backendProxyTarget) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.delete('origin');

  const { pathname, search } = request.nextUrl;
  return NextResponse.rewrite(new URL(`${pathname}${search}`, backendProxyTarget), { request: { headers } });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return proxyToBackend(request);
  }

  // `/`: the server can't tell whether someone is signed in (the access token lives only in the browser's memory and
  // the refresh cookie belongs to the API), so always go to the dashboard, which signs in through the refresh cookie
  // or sends the user to /login.
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

export const config = {
  matcher: ['/', '/auth/:path*', '/api/:path*'],
};
