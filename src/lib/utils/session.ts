import { deleteCookie, readCookie, setCookie } from './cookies';

export const ACCESS_TOKEN_KEY = getCookieKey('access-token');
export const REFRESH_TOKEN_KEY = getCookieKey('refresh-token');

interface AuthTokens {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

function getCookieKey(name: string) {
  const isProductionEnv = process.env.PROJECT_ENV === 'production';
  const isLocalEnv = process.env.NODE_ENV === 'development';

  return isProductionEnv || isLocalEnv ? name : `${process.env.PROJECT_ENV}-${name}`;
}

export function getAuthTokens(): AuthTokens {
  return {
    accessToken: readCookie(ACCESS_TOKEN_KEY),
    refreshToken: readCookie(REFRESH_TOKEN_KEY),
  };
}

export function setAuthTokens({ accessToken, refreshToken }: AuthTokens) {
  setCookie(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });
  setCookie(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
}

export function clearAuthCookies() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}
