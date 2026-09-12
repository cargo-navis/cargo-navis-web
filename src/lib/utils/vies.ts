import axios from 'axios';

import { COUNTRY_CODES } from './countries.const';

// VIES uses EL for Greece instead of the ISO country code used across the app
const VIES_COUNTRY_CODES: Record<string, string> = {
  GR: 'EL',
};

const ISO_COUNTRY_CODES: Record<string, string> = {
  EL: 'GR',
};

const KNOWN_PREFIXES = new Set<string>([...COUNTRY_CODES, ...Object.keys(ISO_COUNTRY_CODES)]);

export const MIN_TAX_NUMBER_LENGTH = 2;

export function toViesCountryCode(countryCode: string) {
  const code = (countryCode || '').trim().toUpperCase();
  return VIES_COUNTRY_CODES[code] || code;
}

export function fromViesCountryCode(viesCountryCode: string) {
  const code = (viesCountryCode || '').trim().toUpperCase();
  return ISO_COUNTRY_CODES[code] || code;
}

export interface ParsedTaxId {
  countryCode: string;
  number: string;
}

/**
 * Splits a full tax id like "HR01746086877" into country and number. The
 * country is only ever read from the input, there is no guessing.
 */
export function parseTaxId(value: string): ParsedTaxId {
  const cleaned = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prefix = cleaned.slice(0, 2);

  if (/^[A-Z]{2}$/.test(prefix) && KNOWN_PREFIXES.has(prefix)) {
    return { countryCode: fromViesCountryCode(prefix), number: cleaned.slice(2) };
  }

  return { countryCode: '', number: cleaned };
}

export function normalizeTaxNumber(value: string, countryCode: string) {
  const cleaned = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prefix = toViesCountryCode(countryCode);

  // "HR12345678901" and "12345678901" both end up as the same number
  return prefix && cleaned.startsWith(prefix) ? cleaned.slice(prefix.length) : cleaned;
}

export function isValidTaxNumber(value: string, countryCode: string) {
  return normalizeTaxNumber(value, countryCode).length >= MIN_TAX_NUMBER_LENGTH;
}

export function buildTaxId(value: string, countryCode: string) {
  const number = normalizeTaxNumber(value, countryCode);

  return number ? `${toViesCountryCode(countryCode)}${number}` : '';
}

export function isCompanyNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
