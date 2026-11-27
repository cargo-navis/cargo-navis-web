import { describe, expect, it } from 'vitest';

import { getCargoLabel, getCargoLabelParts, getPalletsNoun } from './cargo';

const metadata = (overrides: Record<string, unknown> = {}) =>
  ({ type: 'standard', palleteType: 'euro', palleteAmount: 22, width: 0, height: 0, length: 0, ...overrides }) as never;

describe('getCargoLabelParts', () => {
  it('pallets: count and pallet name, description second', () => {
    expect(getCargoLabelParts({ description: 'Hrana', metadata: metadata() })).toEqual({
      primary: '22 x Euro Paleta (120x80)',
      secondary: 'Hrana',
    });
  });

  it('unknown pallet type: just the count', () => {
    expect(getCargoLabelParts({ metadata: metadata({ palleteType: 'barrel', palleteAmount: 5 }) })).toEqual({
      primary: '5 paleta',
      secondary: undefined,
    });
  });

  // Regression: an unknown pallet type said „2 paleta” (KAN-153).
  it('unknown pallet type: Croatian plural', () => {
    expect(getCargoLabelParts({ metadata: metadata({ palleteType: 'barrel', palleteAmount: 2 }) }).primary).toBe(
      '2 palete'
    );
  });

  it('oversize: the dimensions it has', () => {
    expect(
      getCargoLabelParts({ metadata: metadata({ type: 'nonstandard', length: 4.2, width: 2.1, height: 1.8 }) })
    ).toEqual({ primary: '4.2m x 2.1m x 1.8m', secondary: undefined });
    expect(
      getCargoLabelParts({ metadata: metadata({ type: 'nonstandard', length: 4, width: null, height: undefined }) })
        .primary
    ).toBe('4m');
  });

  it('no pallets or dimensions: the description, else a dash', () => {
    expect(getCargoLabelParts({ description: 'Strojevi', metadata: metadata({ palleteAmount: 0 }) })).toEqual({
      primary: 'Strojevi',
    });
    const noDimensions = metadata({ type: 'nonstandard', length: null, width: null, height: null });
    expect(getCargoLabelParts({ description: 'Bager', metadata: noDimensions })).toEqual({ primary: 'Bager' });
    expect(getCargoLabelParts({ description: null, metadata: noDimensions })).toEqual({ primary: '-' });
    expect(getCargoLabelParts({ metadata: metadata({ type: 'other' }) })).toEqual({ primary: '-' });
  });
});

describe('getCargoLabel', () => {
  it('adds the description in brackets', () => {
    expect(getCargoLabel({ description: 'Hrana', metadata: metadata() })).toBe('22 x Euro Paleta (120x80) (Hrana)');
    expect(getCargoLabel({ description: '', metadata: metadata() })).toBe('22 x Euro Paleta (120x80)');
    expect(getCargoLabel({ description: 'Hrana', metadata: metadata({ palleteAmount: 0 }) })).toBe('Hrana');
  });
});

describe('getPalletsNoun', () => {
  it.each([
    [0, 'paleta'],
    [1, 'paleta'],
    [2, 'palete'],
    [3, 'palete'],
    [4, 'palete'],
    [5, 'paleta'],
    [11, 'paleta'],
    [12, 'paleta'],
    [14, 'paleta'],
    [21, 'paleta'],
    [22, 'palete'],
    [24, 'palete'],
    [25, 'paleta'],
    [104, 'palete'],
    [112, 'paleta'],
    [122, 'palete'],
  ])('%i → %s', (count, noun) => {
    expect(getPalletsNoun(count)).toBe(noun);
  });
});
