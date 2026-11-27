import { describe, expect, it } from 'vitest';

import { plural, pluralCount, pluralForm } from './plural';

describe('pluralForm', () => {
  it.each([
    [1, 'one'],
    [21, 'one'],
    [101, 'one'],
    [11, 'many'],
    [111, 'many'],
    [2, 'few'],
    [4, 'few'],
    [22, 'few'],
    [34, 'few'],
    [12, 'many'],
    [14, 'many'],
    [0, 'many'],
    [5, 'many'],
    [20, 'many'],
    [-1, 'one'],
  ] as const)('%i → %s', (count, form) => {
    expect(pluralForm(count)).toBe(form);
  });
});

describe('plural', () => {
  const istovar = ['istovar', 'istovara', 'istovara'] as const;

  it('agrees nouns', () => {
    expect(pluralCount(1, istovar)).toBe('1 istovar');
    expect(pluralCount(3, istovar)).toBe('3 istovara');
    expect(pluralCount(21, istovar)).toBe('21 istovar');
  });

  it('agrees feminine and masculine participles (DECISIONS §1)', () => {
    const isprave = ['istekla', 'istekle', 'isteklo'] as const;
    expect([1, 2, 5].map((n) => pluralCount(n, isprave))).toEqual(['1 istekla', '2 istekle', '5 isteklo']);
    const rokovi = ['istekao', 'istekla', 'isteklo'] as const;
    expect([1, 2, 5].map((n) => pluralCount(n, rokovi))).toEqual(['1 istekao', '2 istekla', '5 isteklo']);
  });

  it('agrees verbs', () => {
    expect(plural(3, ['istječe', 'istječu', 'istječe'])).toBe('istječu');
    expect(plural(5, ['istječe', 'istječu', 'istječe'])).toBe('istječe');
  });
});
