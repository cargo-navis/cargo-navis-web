import { backend } from '@/lib/services/backendService';

import { AuthResponse } from './login';

export interface LoginArgs {
  email: string;
  password: string;
}

export async function login(values: LoginArgs) {
  return backend.post<AuthResponse.RootObject>('/auth/token', values);
}

export async function loginWithJoso() {
  const email = "josip.grubesa@prudentology.com";
  const password = "oyTzFZhgfpw8iF.tehNJ";

  return backend.post<AuthResponse.RootObject>('/auth/token', { email, password });
}

