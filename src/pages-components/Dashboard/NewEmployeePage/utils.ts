/** Phone number split into the calling code (prefix menu) and the rest (today's PhoneNumberInput value). */
export interface PhoneValue {
  countryCode: string;
  phoneNumber: string;
}

/** Calling codes offered in the prefix menu (today's PhoneNumberInput list). */
export const PHONE_PREFIXES = [
  { code: 'HR', prefix: '+385' },
  { code: 'SI', prefix: '+386' },
  { code: 'BA', prefix: '+387' },
  { code: 'RS', prefix: '+381' },
  { code: 'XK', prefix: '+383' },
  { code: 'AL', prefix: '+355' },
  { code: 'MK', prefix: '+389' },
  { code: 'AT', prefix: '+43' },
];

/**
 * Joins country code and phone number into a single string.
 * Removes spaces and a leading "0" (trunk prefix) from the number.
 */
export function joinPhoneNumber(value: PhoneValue): string {
  const digits = value.phoneNumber.trim().replace(/[\s/()-]/g, '');
  // Typed (or stored) with its own international prefix: keep it as it is.
  if (digits.startsWith('+') || !value.countryCode) return digits;
  const clean = digits.startsWith('0') ? digits.substring(1) : digits;
  return `${value.countryCode}${clean}`;
}

/**
 * Splits a full phone number string into one of the known prefixes and the rest. Returns null for any other number
 * (the form then keeps it whole, with its own prefix).
 */
export function splitPhoneNumber(fullPhoneNumber: string): PhoneValue | null {
  if (!fullPhoneNumber || !fullPhoneNumber.startsWith('+')) return null;

  const known = PHONE_PREFIXES.find(({ prefix }) => fullPhoneNumber.startsWith(prefix));
  if (known) return { countryCode: known.prefix, phoneNumber: fullPhoneNumber.substring(known.prefix.length) };

  return null;
}
