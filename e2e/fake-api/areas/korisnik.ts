import type { User } from '@/lib/api/user.d';

import { fail, noContent, ok, route } from '../http';
import { uuid } from '../ids';

/** The signed-in dispatcher. Phase 1 flows log in with these credentials (e2e/auth.setup.ts). */
export const KORISNIK = {
  email: 'dispecer@e2e.cargo-navis.test',
  password: 'Lozinka123!',
};

export const KORISNIK_ID = uuid(301);

/** Invite links for /set-password: this token is accepted once; any other one is invalid or expired. */
export const INVITE = { token: 'e2e-invite-token', email: 'novi.disponent@e2e.cargo-navis.test' };

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
  return {
    user,
    password: KORISNIK.password,
    loggedIn: false,
    usedInvites: [] as string[],
    invitePasswords: {} as Record<string, string>,
  };
}

/** A fake access token: a JWT the client can read (accessTokenExpiry checks `exp`). Expires in 2100, so the frozen
 * clock never makes it expire. `sub` says whose session it is. */
export const accessToken = (sub: string) =>
  [
    { alg: 'HS256', typ: 'JWT' },
    { sub, exp: 4_102_444_800 },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString('base64url'))
    .concat('e2e-signature')
    .join('.');

const ACCESS_TOKEN = accessToken(KORISNIK_ID);

/** Whose session a request carries (the `sub` of its Bearer token), or undefined. */
export function sessionUserId(headers: Record<string, string>): string | undefined {
  const token = headers.authorization?.replace(/^Bearer /, '');
  const payload = token?.split('.')[1];
  if (!payload) return undefined;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).sub;
  } catch {
    return undefined;
  }
}

/**
 * The httpOnly refresh cookie. The dashboard and the driver portal share /auth/refresh (like the backend); the cookie's
 * value says whose session it renews: the dispatcher's, or a driver's (`driver:<id>`, set by /auth/exchange).
 */
export const REFRESH_COOKIE = 'refreshToken';
const REFRESH_VALUE = 'e2e-refresh-token';

function refreshCookie(cookie: string | undefined): string | undefined {
  return cookie
    ?.split(/;\s*/)
    .find((pair) => pair.startsWith(`${REFRESH_COOKIE}=`))
    ?.slice(REFRESH_COOKIE.length + 1);
}

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
  route('POST', '/auth/refresh', ({ headers }) => {
    const value = refreshCookie(headers.cookie);
    if (value === REFRESH_VALUE) return ok({ accessToken: ACCESS_TOKEN });
    if (value?.startsWith('driver:')) return ok({ accessToken: accessToken(value.slice('driver:'.length)) });
    return fail(401, 'No session', 'UNAUTHORIZED');
  }),
  route('POST', '/auth/logout', () => ({
    ...noContent(),
    headers: { 'set-cookie': `${REFRESH_COOKIE}=; Path=/; HttpOnly; Max-Age=0` },
  })),
  // Plain response, no envelope (src/lib/api/auth.ts). A used or unknown token is rejected like an expired one.
  route('POST', '/auth/accept-invite', ({ body }, db) => {
    if (body?.token !== INVITE.token || db.korisnik.usedInvites.includes(body.token)) {
      return fail(400, 'Invalid or expired invite', 'INVALID_INVITE_TOKEN');
    }
    db.korisnik.usedInvites.push(body.token);
    db.korisnik.invitePasswords[INVITE.email] = body.newPassword;
    return noContent();
  }),
  // The signed-in user: the dispatcher, or in the driver portal the driver whose token it is.
  route('GET', '/api/account', ({ headers }, db) => {
    const userId = sessionUserId(headers);
    const driver = userId && userId !== KORISNIK_ID ? db.zaposlenici.find((entry) => entry.id === userId) : undefined;
    return ok(driver ?? db.korisnik.user);
  }),
  route('POST', '/api/account/password', ({ body }, db) => {
    db.korisnik.password = body.password;
    return noContent();
  }),
];
