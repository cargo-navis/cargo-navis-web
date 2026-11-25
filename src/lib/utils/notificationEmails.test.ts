import { describe, expect, it } from 'vitest';

import { isValidEmail, normalizeEmail } from './notificationEmails';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Ana.Horvat@Firma.HR ')).toBe('ana.horvat@firma.hr');
    expect(normalizeEmail('')).toBe('');
  });
});

describe('isValidEmail', () => {
  it.each(['ana@firma.hr', 'ana.horvat+nalozi@firma.co.uk'])('accepts %s', (email) =>
    expect(isValidEmail(email)).toBe(true)
  );

  it.each(['', 'ana', 'ana@', '@firma.hr', 'ana firma@x.hr'])('rejects %j', (email) =>
    expect(isValidEmail(email)).toBe(false)
  );
});
