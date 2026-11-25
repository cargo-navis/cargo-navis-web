import { describe, expect, it } from 'vitest';

import { buildTaxId, fromViesCountryCode, normalizeTaxNumber, parseTaxId, toViesCountryCode } from './vies';

describe('VIES country codes', () => {
  it.each([
    ['GR', 'EL'],
    ['gr', 'EL'],
    [' HR ', 'HR'],
    ['de', 'DE'],
    ['', ''],
  ])('ISO %j → VIES %j', (iso, vies) => expect(toViesCountryCode(iso)).toBe(vies));

  it.each([
    ['EL', 'GR'],
    ['el', 'GR'],
    ['HR', 'HR'],
    [' at', 'AT'],
    ['', ''],
  ])('VIES %j → ISO %j', (vies, iso) => expect(fromViesCountryCode(vies)).toBe(iso));

  it('treats null-ish input as empty', () => {
    expect(toViesCountryCode(undefined as unknown as string)).toBe('');
    expect(fromViesCountryCode(null as unknown as string)).toBe('');
  });
});

describe('parseTaxId', () => {
  it.each([
    ['HR01746086877', 'HR', '01746086877'],
    ['hr 0174-608.6877', 'HR', '01746086877'],
    ['ATU12345678', 'AT', 'U12345678'],
    ['DE 123 456 789', 'DE', '123456789'],
    // VIES writes Greece as EL, the app keeps the ISO code
    ['EL123456789', 'GR', '123456789'],
    ['GR123456789', 'GR', '123456789'],
  ])('%j → %s + %s', (value, countryCode, number) => expect(parseTaxId(value)).toEqual({ countryCode, number }));

  it('does not guess a country for a bare number', () => {
    expect(parseTaxId('01746086877')).toEqual({ countryCode: '', number: '01746086877' });
  });

  it('ignores an unknown letter prefix', () => {
    expect(parseTaxId('ZZ123')).toEqual({ countryCode: '', number: 'ZZ123' });
  });

  it('needs two letters for a prefix', () => {
    expect(parseTaxId('H1234')).toEqual({ countryCode: '', number: 'H1234' });
  });

  it('drops diacritics and other non-alphanumeric characters', () => {
    expect(parseTaxId('HR-č12 34')).toEqual({ countryCode: 'HR', number: '1234' });
  });

  it('handles empty input', () => {
    expect(parseTaxId('')).toEqual({ countryCode: '', number: '' });
    expect(parseTaxId(undefined as unknown as string)).toEqual({ countryCode: '', number: '' });
  });

  it('keeps a lone prefix with an empty number', () => {
    expect(parseTaxId('HR')).toEqual({ countryCode: 'HR', number: '' });
  });
});

describe('normalizeTaxNumber', () => {
  it('strips the country prefix and separators', () => {
    expect(normalizeTaxNumber('HR 0174-6086877', 'HR')).toBe('01746086877');
    expect(normalizeTaxNumber('01746086877', 'HR')).toBe('01746086877');
  });

  it('strips the VIES prefix for Greece', () => {
    expect(normalizeTaxNumber('el123456789', 'GR')).toBe('123456789');
  });

  it('keeps a prefix of another country', () => {
    expect(normalizeTaxNumber('DE123', 'HR')).toBe('DE123');
  });

  it('keeps the value as is without a country', () => {
    expect(normalizeTaxNumber('hr-123', '')).toBe('HR123');
  });

  it('handles empty input', () => {
    expect(normalizeTaxNumber('', 'HR')).toBe('');
  });
});

describe('buildTaxId', () => {
  it('prefixes the VIES country code once', () => {
    expect(buildTaxId('01746086877', 'HR')).toBe('HR01746086877');
    expect(buildTaxId('HR01746086877', 'hr')).toBe('HR01746086877');
    expect(buildTaxId('123456789', 'GR')).toBe('EL123456789');
  });

  it('is empty without a number', () => {
    expect(buildTaxId('', 'HR')).toBe('');
    expect(buildTaxId('HR', 'HR')).toBe('');
    expect(buildTaxId(' - ', 'HR')).toBe('');
  });

  it('round-trips through parseTaxId', () => {
    const taxId = buildTaxId('123456789', 'GR');
    expect(parseTaxId(taxId)).toEqual({ countryCode: 'GR', number: '123456789' });
  });
});
