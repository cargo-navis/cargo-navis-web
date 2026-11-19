import { describe, expect, it } from 'vitest';

import { validateLogin } from './validation';

describe('validateLogin', () => {
  it('requires both fields', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email je obavezan',
      password: 'Lozinka je obavezna',
    });
  });

  it('checks the email format', () => {
    expect(validateLogin({ email: 'ivan@', password: 'x' }).email).toBe('Email mora biti valjanog formata');
    expect(validateLogin({ email: 'ivan@firma.hr', password: 'x' })).toEqual({ email: undefined, password: undefined });
  });
});
