// middleware.ts (at the root of your project)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_KEY } from '@/lib/utils/session';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  const redirectDestination = accessToken ? '/dashboard' : '/login';

  return NextResponse.redirect(new URL(redirectDestination, request.url));
}

export const config = {
  matcher: '/', // only run middleware on the route that had this getServerSideProps
};
