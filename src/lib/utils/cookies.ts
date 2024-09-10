import Cookies from 'js-cookie';

import { safeJsonParse } from './string';

const cookies = Cookies.withConverter({
	read: safeJsonParse,
	write: (value) => {
		if (typeof value === 'object' && value !== null) {
			return JSON.stringify(value);
		}

		return value;
	},
});

export function readCookie<T>(name: string) {
	return cookies.get(name) as unknown as T | undefined;
}

const cookieOptions: Cookies.CookieAttributes = {
	sameSite: 'Lax',
	secure: process.env.NODE_ENV !== 'development',
};

export function setCookie(name: string, value: any, options?: Cookies.CookieAttributes) {
	cookies.set(name, value, { ...options, ...cookieOptions });
}

export function deleteCookie(name: string) {
	cookies.remove(name, cookieOptions);
}
