import { describe, expect, it } from 'vitest';

import type { SearchShipmentCargo } from '@/lib/api/search.d';

import { getCargoSummary } from './utils';

function makeCargo(overrides: Partial<SearchShipmentCargo> = {}): SearchShipmentCargo {
  return {
    id: 'cargo',
    weight: null,
    palleteType: null,
    palleteAmount: null,
    ldm: null,
    dimensions: null,
    description: null,
    ...overrides,
  };
}

describe('getCargoSummary', () => {
  it('shows the description, the pallets and the weight of one cargo', () => {
    const cargo = makeCargo({ description: 'Transformer components', palleteAmount: 10, weight: 1871, ldm: 6.9 });
    expect(getCargoSummary([cargo])).toEqual({
      primary: 'Transformer components',
      primaryTooltip: ['Transformer components'],
      secondaryLead: '10 paleta',
      secondary: '1.871 kg',
    });
  });

  it('adds up several cargos and counts the others after the first description', () => {
    const cargos = [
      makeCargo({ description: 'Transformer components', palleteAmount: 10, weight: 1871 }),
      makeCargo({ palleteAmount: 4, weight: 900 }),
    ];
    expect(getCargoSummary(cargos)).toEqual({
      primary: 'Transformer components +1',
      primaryTooltip: ['Transformer components'],
      secondaryLead: '14 paleta',
      secondary: '2.771 kg',
    });
  });

  it('leads with the dimensions instead of the pallets when the description is on the first line', () => {
    const cargos = [
      makeCargo({
        description: 'Transformer',
        dimensions: { length: 2.4, width: 1.2, height: 1 },
        palleteAmount: 2,
        weight: 900,
      }),
      makeCargo({ dimensions: { length: 1, width: 1, height: 1 } }),
    ];
    expect(getCargoSummary(cargos)).toEqual({
      primary: 'Transformer +1',
      primaryTooltip: ['Transformer'],
      secondaryLead: '2,4 × 1,2 × 1 m',
      secondary: '900 kg',
    });
  });

  it('moves the dimensions to the first line when there is no description', () => {
    const cargo = makeCargo({ dimensions: { length: 3, width: null, height: 2 }, palleteAmount: 4 });
    expect(getCargoSummary([cargo])).toEqual({
      primary: '3 × 2 m',
      primaryTooltip: undefined,
      secondaryLead: '4 palete',
      secondary: undefined,
    });
  });

  it('lists every cargo description in the tooltip', () => {
    const cargos = [makeCargo({ description: 'Transformer' }), makeCargo(), makeCargo({ description: 'Cables' })];
    expect(getCargoSummary(cargos)?.primaryTooltip).toEqual(['Transformer', 'Cables']);
  });

  it('uses palete for 2–4 pallets', () => {
    expect(getCargoSummary([makeCargo({ palleteAmount: 3 })])?.secondaryLead).toBe('3 palete');
    expect(getCargoSummary([makeCargo({ palleteAmount: 12 })])?.secondaryLead).toBe('12 paleta');
  });

  it('leaves out missing values and never shows LDM', () => {
    expect(getCargoSummary([makeCargo({ weight: 500, ldm: 2 })])).toEqual({
      primary: undefined,
      primaryTooltip: undefined,
      secondaryLead: undefined,
      secondary: '500 kg',
    });
  });

  it('returns nothing without cargo data', () => {
    expect(getCargoSummary([])).toBeUndefined();
    expect(getCargoSummary([makeCargo({ ldm: 3 })])).toBeUndefined();
  });
});
