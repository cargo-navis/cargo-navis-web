import { isValidEmail } from '@/lib/utils/notificationEmails';

import type { FormValues } from './types';

export const LOGIN_FAILED_MESSAGE = 'Nismo pronašli nijednog korisnika s tom kombinacijom emaila i lozinke.';

export function validateLogin({ email, password }: FormValues) {
  return {
    email: !email ? 'Email je obavezan' : !isValidEmail(email) ? 'Email mora biti valjanog formata' : undefined,
    password: !password ? 'Lozinka je obavezna' : undefined,
  };
}
