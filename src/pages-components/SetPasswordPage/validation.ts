// Same rules as Moj račun: a password set from an invite is not weaker than one changed later.
import { PASSWORD_RULES, passwordRuleError } from '@/components/shared/password';

import type { FormValues } from './types';

export function validateSetPassword({ newPassword, confirmPassword }: FormValues) {
  return {
    newPassword: !newPassword ? 'Lozinka je obavezna' : passwordRuleError(PASSWORD_RULES, newPassword),
    confirmPassword: !confirmPassword
      ? 'Potvrda lozinke je obavezna'
      : confirmPassword !== newPassword
        ? 'Lozinke se ne podudaraju'
        : undefined,
  };
}
