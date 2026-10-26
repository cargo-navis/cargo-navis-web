// middleware.ts (at the root of your project)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_KEY } from '@/lib/utils/session';

// Routes accessible only to non-authenticated users; logged-in users get sent to the dashboard.
const GUEST_ONLY_ROUTES = ['/set-password'];

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
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return proxyToBackend(request);
  }

  if (GUEST_ONLY_ROUTES.includes(pathname)) {
    return accessToken ? NextResponse.redirect(new URL('/dashboard', request.url)) : NextResponse.next();
  }

  const redirectDestination = accessToken ? '/dashboard' : '/login';

  return NextResponse.redirect(new URL(redirectDestination, request.url));
}

export const config = {
  matcher: ['/', '/set-password', '/auth/:path*', '/api/:path*'],
};
