'use server';

import { FormValues } from './types';
import { apiService } from '@/lib/services/apiService';

export async function login(formValues: FormValues) {
  console.log('Login...');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { email, password } = formValues;
  console.log({ email, password })

  const res = await apiService.post('/auth/token', { email, password });
  console.log(res);

}
