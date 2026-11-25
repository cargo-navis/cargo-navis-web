import { describe, expect, it } from 'vitest';

import { CRUMBS, getRouteBreadcrumbs } from './breadcrumbs';
import { NAV } from './nav';

describe('CRUMBS', () => {
  it('takes section labels and links from the sidebar', () => {
    for (const item of NAV) expect(CRUMBS[item.key]).toEqual({ label: item.label, href: item.href });
    expect(CRUMBS.shipments).toEqual({ label: 'Nalozi', href: '/dashboard/shipments' });
    expect(CRUMBS.vehicleStops).toEqual({ label: 'Prijevozi', href: '/dashboard/vehicle-stops' });
  });

  it('has the sections outside the sidebar', () => {
    expect(CRUMBS.settings).toEqual({ label: 'Postavke', href: '/dashboard/settings/account' });
    expect(CRUMBS.search).toEqual({ label: 'Pretraga', href: '/dashboard/search' });
    expect(CRUMBS.notifications).toEqual({ label: 'Obavijesti', href: '/dashboard/notifications' });
  });
});

describe('getRouteBreadcrumbs', () => {
  it.each([
    ['/dashboard', ['Početna']],
    ['/dashboard/analytics', ['Analitika']],
    ['/dashboard/search', ['Pretraga']],
    ['/dashboard/notifications', ['Obavijesti']],
    ['/dashboard/settings/account', ['Postavke', 'Moj račun']],
    ['/dashboard/settings/company', ['Postavke', 'Tvrtka']],
    ['/dashboard/shipments', ['Nalozi']],
    ['/dashboard/shipments/new', ['Nalozi', 'Novi nalog']],
    ['/dashboard/shipments/[id]', ['Nalozi', 'Nalog']],
    ['/dashboard/shipments/[id]/edit', ['Nalozi', 'Uredi nalog']],
    ['/dashboard/vehicle-stops', ['Prijevozi']],
    ['/dashboard/vehicle-stops/[vehicleId]', ['Prijevozi', 'Ruta']],
    ['/dashboard/vehicle-stops/stop/[stopId]', ['Prijevozi']],
  ])('%s → %j', (pathname, labels) =>
    expect(getRouteBreadcrumbs(pathname).map((crumb) => crumb.label)).toEqual(labels)
  );

  it.each([
    ['/dashboard/fleet', 'Flota', 'Novo vozilo', 'Vozilo', 'Uredi vozilo'],
    ['/dashboard/clients', 'Klijenti', 'Novi klijent', 'Klijent', 'Uredi klijenta'],
    ['/dashboard/contractors', 'Podvozari', 'Novi podvozar', 'Podvozar', 'Uredi podvozara'],
    ['/dashboard/employees', 'Zaposlenici', 'Novi zaposlenik', 'Zaposlenik', 'Uredi zaposlenika'],
  ])('has the CRUD trail of %s', (base, section, created, one, edit) => {
    const crumb = { label: section, href: base };
    expect(getRouteBreadcrumbs(base)).toEqual([crumb]);
    expect(getRouteBreadcrumbs(`${base}/new`)).toEqual([crumb, { label: created }]);
    expect(getRouteBreadcrumbs(`${base}/[id]`)).toEqual([crumb, { label: one }]);
    expect(getRouteBreadcrumbs(`${base}/[id]/edit`)).toEqual([crumb, { label: edit }]);
  });

  it('links every crumb but the current page', () => {
    const [section, current] = getRouteBreadcrumbs('/dashboard/settings/company');
    expect(section.href).toBe('/dashboard/settings/account');
    expect(current.href).toBeUndefined();
  });

  it('falls back to the sidebar section for other routes', () => {
    expect(getRouteBreadcrumbs('/dashboard/fleet/[id]/documents')).toEqual([CRUMBS.fleet]);
    expect(getRouteBreadcrumbs('/dashboard/shipments/drafts')).toEqual([CRUMBS.shipments]);
  });

  it('never falls back to Početna', () => {
    expect(getRouteBreadcrumbs('/dashboard/nope')).toEqual([]);
    expect(getRouteBreadcrumbs('/dashboard/settings/other')).toEqual([]);
  });

  it('does not match a section by prefix alone', () => {
    expect(getRouteBreadcrumbs('/dashboard/fleets')).toEqual([]);
  });

  it('is empty outside the dashboard', () => {
    expect(getRouteBreadcrumbs('/')).toEqual([]);
    expect(getRouteBreadcrumbs('/login')).toEqual([]);
    expect(getRouteBreadcrumbs('')).toEqual([]);
  });
});
