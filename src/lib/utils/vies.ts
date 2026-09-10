import axios from 'axios';

// VIES uses EL for Greece instead of the ISO country code used across the app
const VIES_COUNTRY_CODES: Record<string, string> = {
  GR: 'EL',
};

export const MIN_TAX_NUMBER_LENGTH = 2;

export function toViesCountryCode(countryCode: string) {
  const code = (countryCode || '').trim().toUpperCase();
  return VIES_COUNTRY_CODES[code] || code;
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
