import axios from 'axios';

import { getBackendBaseUrl } from '@/lib/utils/backendBaseUrl';

import type { AuthResponse } from './login';

// Plain axios (not `backend`): these calls run without an access token and must never trigger a refresh.
const authClient = axios.create({ baseURL: getBackendBaseUrl() });

export interface LoginArgs {
  email: string;
  password: string;
}

export async function login(values: LoginArgs) {
  // Credentials so the browser stores the httpOnly refresh cookie from the response.
  const response = await authClient.post<AuthResponse.RootObject>('/auth/token', values, { withCredentials: true });
  return response.data;
}

export interface AcceptInviteArgs {
  token: string;
  newPassword: string;
}

export async function acceptInvite(values: AcceptInviteArgs) {
  await authClient.post<void>('/auth/accept-invite', values);
}

/** Clears the httpOnly refresh cookie, which only the server can remove. */
export async function logout() {
  await authClient.post<void>('/auth/logout', undefined, { withCredentials: true });
}
