import { deleteCookie, readCookie, setCookie } from './cookies';

export const ACCESS_TOKEN_KEY = 'access-token';
// export const REFRESH_TOKEN_KEY ='refresh-token';

interface AuthTokens {
	accessToken: string | undefined;
	// refreshToken: string | undefined;
}

export function getAuthTokens(): AuthTokens {
	return {
		accessToken: readCookie(ACCESS_TOKEN_KEY),
		// refreshToken: readCookie(REFRESH_TOKEN_KEY),
	};
}

export function setAuthTokens({ accessToken }: AuthTokens) {
	setCookie(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });
	// setCookie(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
}

export function clearAuthCookies() {
	deleteCookie(ACCESS_TOKEN_KEY);
	// deleteCookie(REFRESH_TOKEN_KEY);
}
