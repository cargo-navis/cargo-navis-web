import { backend } from '@/lib/services/backendService';

import { AuthResponse } from './login';
import axios from 'axios';

export interface LoginArgs {
  email: string;
  password: string;
}

// TODO - refactor
export async function login(values: LoginArgs) {
  const response = await axios.post<AuthResponse.RootObject>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/token`, values);
  return response.data;
}

export async function loginWithJoso() {
  const email = "josip.grubesa@prudentology.com";
  const password = "oyTzFZhgfpw8iF.tehNJ";

  // return backend.get('https://json-placeholder.mock.beeceptor.com/posts');

  return backend.post<AuthResponse.RootObject>('/auth/token', { email, password });
}

