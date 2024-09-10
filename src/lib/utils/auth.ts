import type { InternalAxiosRequestConfig } from 'axios';

import { isServer } from '@/lib/utils/browser';
import { getAuthTokens } from './session';

export function decorateRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
	return !isServer ? authorizeClientSideRequest(config) : config;
}

function authorizeClientSideRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
	const accessToken = getAuthTokens()?.accessToken;
	if (!accessToken) {
		return config;
	}

	return decorateWithBearerToken(config, accessToken);
}

function decorateWithBearerToken(config: InternalAxiosRequestConfig, token: string): InternalAxiosRequestConfig {
	config.headers.Authorization = `Bearer ${token}`;
	return config;
}
