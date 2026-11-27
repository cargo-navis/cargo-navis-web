import { describe, expect, it } from 'vitest';

import { pageNameOf } from './pageNames';

describe('pageNameOf', () => {
  it('names list pages, with or without host, query or trailing slash', () => {
    expect(pageNameOf('https://dev.cargo-navis.com/dashboard')).toBe('Početna');
    expect(pageNameOf('/dashboard/shipments?page=2')).toBe('Nalozi');
    expect(pageNameOf('/dashboard/vehicle-stops/')).toBe('Prijevozi');
    expect(pageNameOf('/dashboard/settings/company')).toBe('Postavke · Tvrtka');
  });

  it('one name for every id, and „new” is not an id', () => {
    expect(pageNameOf('/dashboard/shipments/42d25fb1-5175-4956-8d9e-412b54dc2724')).toBe('Nalog');
    expect(pageNameOf('/dashboard/shipments/new?draftId=a0dbfac9')).toBe('Novi nalog');
    expect(pageNameOf('/dashboard/shipments/42d25fb1/assign?created=1')).toBe('Dodijeli vozilo');
    expect(pageNameOf('/dashboard/clients/05ca9317/edit')).toBe('Uredi klijenta');
    expect(pageNameOf('/dashboard/vehicle-stops/v1')).toBe('Ruta');
    expect(pageNameOf('/dashboard/vehicle-stops/stop/s1')).toBe('Ruta (redirecting...)');
  });

  it('the drafts tab of Nalozi', () => {
    expect(pageNameOf('/dashboard/shipments?tab=drafts')).toBe('Nalozi u pripremi');
  });

  it('unknown pages get no name', () => {
    expect(pageNameOf('/dashboard/unknown')).toBeUndefined();
    expect(pageNameOf('/login')).toBeUndefined();
  });
});
