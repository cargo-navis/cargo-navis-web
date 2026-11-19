import { passwordRuleError } from '@/components/shared/password';

import { SET_PASSWORD_RULES } from './const';
import type { FormValues } from './types';

export function validateSetPassword({ newPassword, confirmPassword }: FormValues) {
  return {
    newPassword: !newPassword ? 'Lozinka je obavezna' : passwordRuleError(SET_PASSWORD_RULES, newPassword),
    confirmPassword: !confirmPassword
      ? 'Potvrda lozinke je obavezna'
      : confirmPassword !== newPassword
        ? 'Lozinke se ne podudaraju'
        : undefined,
  };
}
