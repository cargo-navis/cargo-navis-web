import { describe, expect, it } from 'vitest';

import { VehicleEnum } from '@/lib/api';
import type { GlobalSearchResults, SearchShipment, SearchShipmentCargo } from '@/lib/api/search.d';

import {
  getCargoSummary,
  getSearchCategoryTotal,
  getSearchPageHref,
  isSearchCategoryKey,
  mapToSearchResultGroups,
  SEARCH_CATEGORIES,
  type SearchCategoryKey,
} from './utils';

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

const SAMPLE = {
  fleet: { id: 'v1', matchedValue: 'ZG', registration: 'ZG 1', brand: 'MAN', fleetType: VehicleEnum.VAN },
  employees: {
    id: 'e1',
    matchedValue: 'Ivan',
    firstName: 'Ivan',
    lastName: 'Horvat',
    email: 'i@f.hr',
    phoneNumber: null,
  },
  clients: { id: 'c1', matchedValue: 'Bomark', name: 'Bomark', vatNumber: null },
  contractors: { id: 'c1', matchedValue: 'Šped', name: 'Šped', vatNumber: null },
};

const page = <T>(items: T[], total = items.length) => ({ items, total });

function makeResults(overrides: Partial<GlobalSearchResults> = {}): GlobalSearchResults {
  return {
    shipments: page([]),
    fleet: page([]),
    employees: page([]),
    clients: page([]),
    contractors: page([]),
    ...overrides,
  };
}

function makeShipment(overrides: Partial<SearchShipment> = {}): SearchShipment {
  return {
    id: 's1',
    matchedValue: '2041',
    orderNumber: '2041',
    externalOrderReference: null,
    clientName: null,
    transportContractorName: null,
    isAgency: false,
    cargos: [],
    ...overrides,
  };
}

const category = (key: SearchCategoryKey) => SEARCH_CATEGORIES.find((c) => c.key === key)!;
const mapOne = (key: SearchCategoryKey, results: GlobalSearchResults) => category(key).mapItems(results)[0];

describe('shipment results', () => {
  const mapShipment = (overrides: Partial<SearchShipment>) =>
    mapOne('shipments', makeResults({ shipments: page([makeShipment(overrides)]) }));

  it('links the nalog and shows the client and the reference', () => {
    expect(mapShipment({ clientName: 'Bomark Pak', externalOrderReference: 'PO-77' })).toEqual({
      id: 's1',
      href: '/dashboard/shipments/s1',
      title: '2041',
      isAgency: false,
      subtitle: 'Bomark Pak • PO-77',
      detail: undefined,
      aside: undefined,
    });
  });

  it('falls back to the contractor without a client', () => {
    expect(mapShipment({ transportContractorName: 'Đurić Šped' }).subtitle).toBe('Đurić Šped');
  });

  it('puts the podvozar of an agency nalog on its own line', () => {
    const item = mapShipment({ isAgency: true, clientName: 'Bomark Pak', transportContractorName: 'Đurić Šped' });
    expect(item).toMatchObject({
      isAgency: true,
      subtitle: 'Bomark Pak',
      detail: { label: 'Podvozar', value: 'Đurić Šped' },
    });
  });

  it('has no subtitle without names', () => {
    expect(mapShipment({ isAgency: true }).subtitle).toBeUndefined();
  });

  it('summarises the cargo aside', () => {
    expect(mapShipment({ cargos: [makeCargo({ weight: 500 })] }).aside?.secondary).toBe('500 kg');
    expect(mapShipment({ cargos: null as unknown as SearchShipmentCargo[] }).aside).toBeUndefined();
  });

  it('shows the matched value only when it is not visible already', () => {
    expect(mapShipment({ matchedValue: '2041' }).matchedValue).toBeUndefined();
    expect(mapShipment({ clientName: 'Bomark Pak', matchedValue: 'Bomark' }).matchedValue).toBeUndefined();
    expect(
      mapShipment({ isAgency: true, transportContractorName: 'Đurić Šped', matchedValue: 'Šped' }).matchedValue
    ).toBeUndefined();
    expect(mapShipment({ cargos: [makeCargo({ description: 'Kabeli' })], matchedValue: 'Kabeli' }).matchedValue).toBe(
      undefined
    );
    expect(mapShipment({ matchedValue: 'HR-REF-9' }).matchedValue).toBe('HR-REF-9');
  });
});

describe('other results', () => {
  it('shows the vehicle type and brand', () => {
    const fleet = page([
      { id: 'v1', matchedValue: 'KC 123-AB', registration: 'KC 123-AB', brand: 'Volvo', fleetType: VehicleEnum.TRUCK },
    ]);
    expect(mapOne('fleet', makeResults({ fleet }))).toEqual({
      id: 'v1',
      href: '/dashboard/fleet/v1',
      title: 'KC 123-AB',
      subtitle: 'Tegljač • Volvo',
    });
  });

  it.each([
    [VehicleEnum.TRAILER, 'Poluprikolica'],
    [VehicleEnum.SOLO_TRUCK, 'Solo kamion'],
    [VehicleEnum.VAN, 'Kombi'],
  ])('labels %s as %s', (fleetType, label) => {
    const fleet = page([{ id: 'v1', matchedValue: 'ZG', registration: 'ZG 1', brand: '', fleetType }]);
    expect(mapOne('fleet', makeResults({ fleet })).subtitle).toBe(label);
  });

  it('shows the employee email and phone', () => {
    const phoneNumber = {
      value: '+385 91 123 4567',
      countryCode: '385',
      nationalNumber: '911234567',
      countryName: 'HR',
    };
    const employee = { id: 'e1', firstName: 'Ivan', lastName: 'Horvat', email: 'ivan@firma.hr', phoneNumber };
    const employees = page([
      { ...employee, matchedValue: '911234567' },
      { ...employee, id: 'e2', phoneNumber: null, matchedValue: 'Horvat' },
    ]);
    expect(category('employees').mapItems(makeResults({ employees }))).toEqual([
      {
        id: 'e1',
        href: '/dashboard/employees/e1',
        title: 'Ivan Horvat',
        subtitle: 'ivan@firma.hr • +385 91 123 4567',
        matchedValue: '911234567',
      },
      { id: 'e2', href: '/dashboard/employees/e2', title: 'Ivan Horvat', subtitle: 'ivan@firma.hr' },
    ]);
  });

  it.each([
    ['clients', '/dashboard/clients/c1'],
    ['contractors', '/dashboard/contractors/c1'],
  ] as const)('shows the VAT number of %s', (key, href) => {
    const companies = page([
      { id: 'c1', name: 'Bomark Pak', vatNumber: 'HR01746086877', matchedValue: 'HR01746086877' },
      { id: 'c2', name: 'Bez OIB-a', vatNumber: null, matchedValue: 'Bez' },
    ]);
    const [withVat, withoutVat] = category(key).mapItems(makeResults({ [key]: companies }));
    expect(withVat).toEqual({ id: 'c1', href, title: 'Bomark Pak', subtitle: 'HR01746086877' });
    expect(withoutVat.subtitle).toBeUndefined();
  });

  it('is empty when a category is missing', () => {
    expect(category('fleet').mapItems({} as GlobalSearchResults)).toEqual([]);
  });
});

describe('search helpers', () => {
  it('knows the category keys', () => {
    expect(['shipments', 'fleet', 'employees', 'clients', 'contractors'].every(isSearchCategoryKey)).toBe(true);
    expect(isSearchCategoryKey('vehicleStops')).toBe(false);
    expect(isSearchCategoryKey(undefined)).toBe(false);
  });

  it('reads a category total', () => {
    expect(getSearchCategoryTotal(makeResults({ fleet: page([], 7) }), 'fleet')).toBe(7);
    expect(getSearchCategoryTotal(undefined, 'fleet')).toBe(0);
    expect(getSearchCategoryTotal({} as GlobalSearchResults, 'fleet')).toBe(0);
  });

  it('builds the search page link', () => {
    expect(getSearchPageHref('Đuro Šped')).toBe('/dashboard/search?query=%C4%90uro+%C5%A0ped');
    expect(getSearchPageHref('2041', 'shipments')).toBe('/dashboard/search?query=2041&type=shipments');
    expect(getSearchPageHref('')).toBe('/dashboard/search?query=');
  });
});

describe('mapToSearchResultGroups', () => {
  it('keeps only categories with results, in a fixed order', () => {
    const results = makeResults({
      clients: page([{ id: 'c1', name: 'Bomark', vatNumber: null, matchedValue: 'Bomark' }]),
      shipments: page([makeShipment()]),
    });
    expect(mapToSearchResultGroups(results, 'bo').map((group) => [group.key, group.heading, group.icon])).toEqual([
      ['shipments', 'Nalozi', 'IconFileDescription'],
      ['clients', 'Klijenti', 'IconBriefcase'],
    ]);
  });

  it('offers „Prikaži svih” only when there are more matches', () => {
    const groups = mapToSearchResultGroups(
      makeResults({
        shipments: page([makeShipment()], 12),
        contractors: page([{ id: 'c1', name: 'Šped', vatNumber: null, matchedValue: 'Šped' }], 1),
      }),
      'šped'
    );
    expect(groups[0].showAll).toEqual({
      href: '/dashboard/search?query=%C5%A1ped&type=shipments',
      label: 'Prikaži svih 12 naloga',
    });
    expect(groups[1].showAll).toBeUndefined();
  });

  it.each([
    ['fleet', 'vozila'],
    ['employees', 'zaposlenika'],
    ['clients', 'klijenata'],
    ['contractors', 'podvozara'],
  ] as const)('uses the genitive plural for %s', (key, noun) => {
    const groups = mapToSearchResultGroups(makeResults({ [key]: page([SAMPLE[key]], 21) }), 'x');
    expect(groups[0].showAll?.label).toBe(`Prikaži svih 21 ${noun}`);
  });

  it('is empty without results', () => {
    expect(mapToSearchResultGroups(makeResults(), 'x')).toEqual([]);
  });
});
