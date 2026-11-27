import { describe, expect, it } from 'vitest';

import { getCountryName, getCountryOptions, getEuropeCountryOptions } from './countries';
import { EUROPE_COUNTRY_CODES } from './countries.const';

describe('getCountryName', () => {
  it('uses the Croatian name', () => {
    expect(getCountryName('HR')).toBe('Hrvatska');
    expect(getCountryName('DE')).toBe('Njemačka');
  });

  it('falls back to the code', () => {
    expect(getCountryName('QQ')).toBe('QQ');
  });
});

describe('getCountryOptions', () => {
  it('pairs codes with names', () => {
    expect(getCountryOptions(['HR', 'AT'])).toEqual([
      { code: 'AT', name: 'Austrija' },
      { code: 'HR', name: 'Hrvatska' },
    ]);
  });

  it('sorts by name, not code', () => {
    expect(getCountryOptions(['DE', 'AT', 'SI']).map((country) => country.code)).toEqual(['AT', 'DE', 'SI']);
    expect(getCountryOptions(['HR', 'GR']).map((country) => country.code)).toEqual(['GR', 'HR']);
  });

  it('is empty for no codes', () => {
    expect(getCountryOptions([])).toEqual([]);
  });

  // Regression: sorting followed the browser's language, which put „Češka” before „Cipar” (KAN-153).
  it('sorts by the Croatian alphabet', () => {
    expect(getCountryOptions(['CZ', 'CY', 'ME']).map((country) => country.name)).toEqual([
      'Cipar',
      'Crna Gora',
      'Češka',
    ]);
  });
});

describe('getEuropeCountryOptions', () => {
  it('lists every European code once', () => {
    const codes = getEuropeCountryOptions().map((country) => country.code);
    expect(codes).toHaveLength(EUROPE_COUNTRY_CODES.length);
    expect(new Set(codes)).toEqual(new Set(EUROPE_COUNTRY_CODES));
    expect(codes).toContain('HR');
  });
});
