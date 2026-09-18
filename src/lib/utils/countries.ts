import { COUNTRY_CODES, EUROPE_COUNTRY_CODES } from './countries.const';

export interface Country {
  code: string;
  name: string;
}

const displayNames = typeof Intl !== 'undefined' ? new Intl.DisplayNames(['hr'], { type: 'region' }) : undefined;

/** Falls back to the raw code for regions the runtime has no name for. */
export function getCountryName(code: string) {
  return displayNames?.of(code) ?? code;
}

/** Country codes paired with their display names, sorted by name. */
export function getCountryOptions(codes: readonly string[] = COUNTRY_CODES): Country[] {
  return codes.map((code) => ({ code, name: getCountryName(code) })).sort((a, b) => a.name.localeCompare(b.name));
}

/** The European subset, for the forms that only ever deal with European countries. */
export function getEuropeCountryOptions(): Country[] {
  return getCountryOptions(EUROPE_COUNTRY_CODES);
}
