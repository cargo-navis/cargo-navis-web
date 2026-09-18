// middleware.ts (at the root of your project)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_KEY } from '@/lib/utils/session';

// Routes accessible only to non-authenticated users; logged-in users get sent to the dashboard.
const GUEST_ONLY_ROUTES = ['/set-password'];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (GUEST_ONLY_ROUTES.includes(pathname)) {
    return accessToken ? NextResponse.redirect(new URL('/dashboard', request.url)) : NextResponse.next();
  }

  const redirectDestination = accessToken ? '/dashboard' : '/login';

  return NextResponse.redirect(new URL(redirectDestination, request.url));
}

export const config = {
  matcher: ['/', '/set-password'],
};
