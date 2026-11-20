import { describe, expect, it } from 'vitest';

import {
  displayPath,
  ENTITY_NOT_FOUND,
  type EntityKind,
  isNotFoundError,
  notFoundContext,
  PAGE_NOT_FOUND,
  ROUTE_NOT_FOUND,
} from './not-found-copy';

describe('ENTITY_NOT_FOUND', () => {
  it('agrees with the noun’s gender', () => {
    expect(ENTITY_NOT_FOUND.shipment).toMatchObject({ title: 'Nalog nije pronađen', description: 'Možda je obrisan.' });
    expect(ENTITY_NOT_FOUND.vehicle).toMatchObject({
      title: 'Vozilo nije pronađeno',
      description: 'Možda je obrisano.',
    });
    expect(ENTITY_NOT_FOUND.employee.title).toBe('Zaposlenik nije pronađen');
    expect(ENTITY_NOT_FOUND.client.title).toBe('Klijent nije pronađen');
    expect(ENTITY_NOT_FOUND.contractor.title).toBe('Kontraktor nije pronađen');
  });

  it('offers the list and a new one in the same section', () => {
    const sections: Record<EntityKind, string> = {
      shipment: '/dashboard/shipments',
      vehicle: '/dashboard/fleet',
      employee: '/dashboard/employees',
      client: '/dashboard/clients',
      contractor: '/dashboard/contractors',
    };
    for (const [kind, section] of Object.entries(sections) as [EntityKind, string][]) {
      expect(ENTITY_NOT_FOUND[kind].list.href).toBe(section);
      expect(ENTITY_NOT_FOUND[kind].create.href).toBe(`${section}/new`);
    }
    expect(ENTITY_NOT_FOUND.shipment.list.label).toBe('Svi nalozi');
    expect(ENTITY_NOT_FOUND.shipment.create.label).toBe('Novi nalog');
    expect(ENTITY_NOT_FOUND.vehicle.list.label).toBe('Sva vozila');
  });

  it('keeps the page and route copy from the lab', () => {
    expect(PAGE_NOT_FOUND.title).toBe('Ova stranica ne postoji');
    expect(PAGE_NOT_FOUND.description).toBe('Možda je link zastario ili je sadržaj obrisan.');
    expect(ROUTE_NOT_FOUND.title).toBe('Skrenuli smo s rute.');
    expect(ROUTE_NOT_FOUND.home.href).toBe('/');
  });
});

describe('notFoundContext', () => {
  it('is the app for /dashboard and below', () => {
    expect(notFoundContext('/dashboard')).toBe('app');
    expect(notFoundContext('/dashboard/nope')).toBe('app');
    expect(notFoundContext('/dashboard/shipments/1/nope')).toBe('app');
  });

  it('is outside for anything else', () => {
    expect(notFoundContext('/')).toBe('outside');
    expect(notFoundContext('/nope')).toBe('outside');
    expect(notFoundContext('/dashboards')).toBe('outside');
    expect(notFoundContext('/driver/nope')).toBe('outside');
  });
});

describe('isNotFoundError', () => {
  it('is true only for an API 404', () => {
    expect(isNotFoundError({ response: { status: 404 } })).toBe(true);
    expect(isNotFoundError({ response: { status: 500 } })).toBe(false);
    expect(isNotFoundError({ response: { status: 403 } })).toBe(false);
    expect(isNotFoundError({ request: {} })).toBe(false);
    expect(isNotFoundError(new Error('Network Error'))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
    expect(isNotFoundError(undefined)).toBe(false);
  });
});

describe('displayPath', () => {
  it('drops the query and hash', () => {
    expect(displayPath('/dashboard/shipments/2041?tab=dokumenti#x')).toBe('/dashboard/shipments/2041');
    expect(displayPath('/dashboard/fleet/318')).toBe('/dashboard/fleet/318');
    expect(displayPath('')).toBe('/');
  });
});
