import { describe, expect, it } from 'vitest';

import { PASSWORD_RULES, passwordRuleError } from '@/components/shared/password';

import { validateSetPassword } from './validation';

describe('validateSetPassword', () => {
  it('requires both fields', () => {
    expect(validateSetPassword({ newPassword: '', confirmPassword: '' })).toEqual({
      newPassword: 'Lozinka je obavezna',
      confirmPassword: 'Potvrda lozinke je obavezna',
    });
  });

  it('keeps the invite rule: at least 8 characters, nothing else', () => {
    expect(validateSetPassword({ newPassword: 'abcdefg', confirmPassword: 'abcdefg' }).newPassword).toBe(
      'Lozinka mora imati najmanje 8 znakova'
    );
    expect(validateSetPassword({ newPassword: 'abcdefgh', confirmPassword: 'abcdefgh' })).toEqual({
      newPassword: undefined,
      confirmPassword: undefined,
    });
  });

  it('wants the repeat to match', () => {
    expect(validateSetPassword({ newPassword: 'abcdefgh', confirmPassword: 'abcdefgx' }).confirmPassword).toBe(
      'Lozinke se ne podudaraju'
    );
  });
});

describe('PASSWORD_RULES (Moj račun)', () => {
  it('reports the first failing rule', () => {
    expect(passwordRuleError(PASSWORD_RULES, 'abc')).toBe('Lozinka mora imati najmanje 10 znakova');
    expect(passwordRuleError(PASSWORD_RULES, 'abcdefghij')).toBe('Lozinka mora sadržavati najmanje jedno veliko slovo');
    expect(passwordRuleError(PASSWORD_RULES, 'Abcdefghij')).toBe('Lozinka mora sadržavati najmanje jednu znamenku');
    expect(passwordRuleError(PASSWORD_RULES, 'Abcdefghi1')).toBeUndefined();
  });
});
