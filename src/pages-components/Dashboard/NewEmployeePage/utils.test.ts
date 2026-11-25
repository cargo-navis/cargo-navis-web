import { describe, expect, it } from 'vitest';

import { joinPhoneNumber, splitPhoneNumber } from './utils';

describe('joinPhoneNumber', () => {
  it.each([
    ['+385', '912345678', '+385912345678'],
    ['+385', '091 234 5678', '+385912345678'],
    ['+385', '  091/234-56-78 ', '+385912345678'],
    ['+385', '(091) 234 5678', '+385912345678'],
    ['+43', '0664 1234567', '+436641234567'],
    ['+385', '+386 41 123 456', '+38641123456'],
    ['', '091 234 5678', '0912345678'],
  ])('%s + „%s” → %s', (countryCode, phoneNumber, joined) =>
    expect(joinPhoneNumber({ countryCode, phoneNumber })).toBe(joined)
  );

  // Regression: „00386 …” became +3850386… (KAN-153).
  it('reads a leading 00 as an international prefix', () => {
    expect(joinPhoneNumber({ countryCode: '+385', phoneNumber: '00386 41 123 456' })).toBe('+38641123456');
  });
});

describe('splitPhoneNumber', () => {
  it.each([
    ['+385912345678', { countryCode: '+385', phoneNumber: '912345678' }],
    ['+38641123456', { countryCode: '+386', phoneNumber: '41123456' }],
    ['+436641234567', { countryCode: '+43', phoneNumber: '6641234567' }],
    ['+38345123456', { countryCode: '+383', phoneNumber: '45123456' }],
  ])('%s → %j', (full, split) => expect(splitPhoneNumber(full)).toEqual(split));

  it.each(['', '0912345678', '+49301234567', '385912345678'])('„%s” → null', (full) =>
    expect(splitPhoneNumber(full)).toBeNull()
  );

  it('round-trips with joinPhoneNumber', () => {
    const split = splitPhoneNumber('+385912345678')!;
    expect(joinPhoneNumber(split)).toBe('+385912345678');
  });
});
