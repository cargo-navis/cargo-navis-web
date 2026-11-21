/**
 * Croatian plural agreement (DECISIONS §1 Words): one form for 1, 21, 31 … (not 11), „few” for 2–4, 22–24 … (not
 * 12–14), „many” for the rest.
 *
 *   plural(3, ['istovar', 'istovara', 'istovara'])  → 'istovara'
 *   pluralCount(1, ['istekla', 'istekle', 'isteklo']) → '1 istekla'   (Isprave, feminine)
 *   pluralCount(5, ['istekao', 'istekla', 'isteklo']) → '5 isteklo'   (Rokovi, masculine)
 */

export type PluralForms = readonly [one: string, few: string, many: string];

export type PluralForm = 'one' | 'few' | 'many';

export function pluralForm(count: number): PluralForm {
  const n = Math.abs(Math.trunc(count));
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit === 1 && lastTwo !== 11) return 'one';
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'few';
  return 'many';
}

/** The word that agrees with `count`. */
export function plural(count: number, forms: PluralForms): string {
  const form = pluralForm(count);
  return form === 'one' ? forms[0] : form === 'few' ? forms[1] : forms[2];
}

/** `count` followed by the word that agrees with it. */
export function pluralCount(count: number, forms: PluralForms): string {
  return `${count} ${plural(count, forms)}`;
}

/** dan / dana. */
export const DAYS: PluralForms = ['dan', 'dana', 'dana'];
