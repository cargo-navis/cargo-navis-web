import type { User } from '@/lib/api/user.d';

import { fail, noContent, ok, route } from '../http';
import { uuid } from '../ids';

/** The signed-in dispatcher. Phase 1 flows log in with these credentials (e2e/auth.setup.ts). */
export const KORISNIK = {
  email: 'dispecer@e2e.cargo-navis.test',
  password: 'Lozinka123!',
};

export const KORISNIK_ID = uuid(301);

export function seedKorisnik() {
  const user: User = {
    id: KORISNIK_ID,
    firstName: 'Marija',
    lastName: 'Kovač',
    fullName: 'Marija Kovač',
    phoneNumber: '+385911234567',
    email: KORISNIK.email,
    gender: 'F' as User['gender'],
    positions: ['dispatcher', 'manager'] as User['positions'],
    governmentId: '12345678901',
    nationality: 'HR',
    hasSetPassword: true,
    deleted: false,
    messageChannel: null,
  };
  return { user, password: KORISNIK.password, loggedIn: false };
}

// The fake access token: a JWT the client can read (accessTokenExpiry checks `exp`). Expires in 2100, so the frozen
// clock never makes it expire.
const ACCESS_TOKEN = [
  { alg: 'HS256', typ: 'JWT' },
  { sub: KORISNIK_ID, exp: 4_102_444_800 },
]
  .map((part) => Buffer.from(JSON.stringify(part)).toString('base64url'))
  .concat('e2e-signature')
  .join('.');

export const REFRESH_COOKIE = 'refreshToken';
const REFRESH_VALUE = 'e2e-refresh-token';

const hasRefreshCookie = (cookie: string | undefined) =>
  !!cookie?.split(/;\s*/).some((pair) => pair === `${REFRESH_COOKIE}=${REFRESH_VALUE}`);

export const korisnikRoutes = [
  // Login answers without the envelope (src/lib/api/auth.ts); it sets the httpOnly refresh cookie like the backend.
  route('POST', '/auth/token', ({ body }, db) => {
    if (body?.email !== db.korisnik.user.email || body?.password !== db.korisnik.password) {
      return fail(401, 'Bad credentials', 'BAD_CREDENTIALS');
    }
    return {
      status: 200,
      body: { accessToken: ACCESS_TOKEN },
      headers: { 'set-cookie': `${REFRESH_COOKIE}=${REFRESH_VALUE}; Path=/; HttpOnly; SameSite=Lax` },
    };
  }),
  route('POST', '/auth/refresh', ({ headers }) =>
    hasRefreshCookie(headers.cookie) ? ok({ accessToken: ACCESS_TOKEN }) : fail(401, 'No session', 'UNAUTHORIZED')
  ),
  route('POST', '/auth/logout', () => ({
    ...noContent(),
    headers: { 'set-cookie': `${REFRESH_COOKIE}=; Path=/; HttpOnly; Max-Age=0` },
  })),
  route('GET', '/api/account', (_, db) => ok(db.korisnik.user)),
  route('POST', '/api/account/password', ({ body }, db) => {
    db.korisnik.password = body.password;
    return noContent();
  }),
];
