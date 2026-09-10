import { COUNTRY_CODES } from './countries.const';

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
export function getCountryOptions(): Country[] {
  return COUNTRY_CODES.map((code) => ({ code, name: getCountryName(code) })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
