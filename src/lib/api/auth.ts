import { AuthResponse } from './login';
import axios from 'axios';

export interface LoginArgs {
  email: string;
  password: string;
}

export async function login(values: LoginArgs) {
  const response = await axios.post<AuthResponse.RootObject>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/token`, values);
  return response.data;
}

