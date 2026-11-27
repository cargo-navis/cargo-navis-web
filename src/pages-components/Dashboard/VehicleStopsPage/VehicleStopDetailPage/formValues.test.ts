import { describe, expect, it } from 'vitest';

import type { VehicleStop, VehicleStopCargo } from '@/lib/api/vehicleStops';

import {
  editStopValues,
  newStopValues,
  postalCodeLabel,
  type StopFormValues,
  toFormCargo,
  toPayload,
  validateStop,
} from './formValues';

const shipment = { id: 's1', orderNumber: '2041/2026', clientId: null };
const metadata = { type: 'standard', palleteType: 'euro', palleteAmount: 33, width: 0, height: 0, length: 0 };
const postalCode = { id: 'pc1', postalCode: '48000', placeName: 'Koprivnica', countryCode: 'HR' };

const cargo = (id: string): VehicleStopCargo => ({ id, shipment, description: null, metadata }) as VehicleStopCargo;

const stop = (overrides: Partial<VehicleStop> = {}): VehicleStop => ({
  id: 'st1',
  createdAt: '',
  vehicleId: 'v1',
  previousStopId: null,
  address: null,
  date: null,
  driverId: null,
  trailerId: null,
  disponentId: null,
  loadingCargos: [],
  unloadingCargos: [],
  documents: [],
  messageSentAt: null,
  ...overrides,
});

const values = (overrides: Partial<StopFormValues> = {}): StopFormValues => ({
  ...newStopValues(),
  streetName: 'Ulica 1',
  postalCode,
  ...overrides,
});

describe('toFormCargo', () => {
  it('labels the cargo and keeps its nalog', () => {
    expect(toFormCargo({ id: 'c1', metadata }, shipment)).toEqual({
      id: 'c1',
      shipment,
      label: '33 x Euro Paleta (120x80)',
    });
    expect(toFormCargo({ id: 'c1', metadata, description: 'Krhko' }).shipment).toBeNull();
    expect(toFormCargo({ id: 'c1', metadata, description: 'Krhko' }).label).toBe('33 x Euro Paleta (120x80) (Krhko)');
  });
});

describe('newStopValues', () => {
  it('starts empty', () => {
    expect(newStopValues()).toEqual({
      addressMode: 'search',
      addressKey: null,
      streetName: '',
      countryCode: '',
      postalCode: null,
      date: null,
      driverId: '',
      trailerId: '',
      disponentId: '',
      loading: [],
      unloading: [],
    });
  });

  it('carries driver, trailer and disponent over from the stop before', () => {
    const previous = stop({
      driverId: 'd1',
      trailerId: 't1',
      disponentId: 'p1',
      date: '2026-11-07',
      loadingCargos: [cargo('c1')],
    });
    expect(newStopValues(previous)).toMatchObject({
      driverId: 'd1',
      trailerId: 't1',
      disponentId: 'p1',
      date: null,
      loading: [],
    });
    expect(newStopValues(stop()).driverId).toBe('');
  });
});

describe('editStopValues', () => {
  it('fills the form from the stop', () => {
    const value = stop({
      address: {
        streetName: 'Ulica 1',
        postalCodeId: 'pc1',
        postalCode: '48000',
        countryCode: 'HR',
        placeName: 'Koprivnica',
      },
      date: '2026-11-07',
      driverId: 'd1',
      loadingCargos: [cargo('c1')],
      unloadingCargos: [cargo('c2')],
    });
    expect(editStopValues(value)).toEqual({
      addressMode: 'search',
      addressKey: 'st1:pc1',
      streetName: 'Ulica 1',
      countryCode: 'HR',
      postalCode,
      date: '2026-11-07',
      driverId: 'd1',
      trailerId: '',
      disponentId: '',
      loading: [{ id: 'c1', shipment, label: '33 x Euro Paleta (120x80)' }],
      unloading: [{ id: 'c2', shipment, label: '33 x Euro Paleta (120x80)' }],
    });
  });

  it('handles a stop without an address or street', () => {
    expect(editStopValues(stop())).toMatchObject({
      addressKey: null,
      streetName: '',
      countryCode: '',
      postalCode: null,
    });
    const noStreet = stop({
      address: { streetName: null, postalCodeId: 'pc1', postalCode: '48000', countryCode: null, placeName: null },
    });
    expect(editStopValues(noStreet)).toMatchObject({ streetName: '', countryCode: '' });
  });
});

describe('validateStop', () => {
  const addressError = { address: 'Odaberi adresu ili upiši prilagođenu.' };

  it('passes with an address', () => {
    expect(validateStop(values())).toEqual({});
    expect(validateStop(values({ addressMode: 'custom' }))).toEqual({});
  });

  it.each([
    ['no postal code', { postalCode: null }],
    ['no street', { streetName: '' }],
    ['a blank street', { streetName: '   ' }],
  ])('search: %s → address error', (_, patch) => expect(validateStop(values(patch))).toEqual(addressError));

  it('custom: names each missing field', () => {
    expect(validateStop(values({ addressMode: 'custom', streetName: ' ' }))).toEqual({
      streetName: 'Upiši ulicu i broj.',
    });
    expect(validateStop(values({ addressMode: 'custom', postalCode: null }))).toEqual({
      postalCode: 'Odaberi poštanski broj.',
    });
    expect(validateStop(values({ addressMode: 'custom', streetName: '', postalCode: null }))).toEqual({
      streetName: 'Upiši ulicu i broj.',
      postalCode: 'Odaberi poštanski broj.',
    });
  });

  it('needs nothing else', () => {
    expect(validateStop(values({ date: null, driverId: '', loading: [], unloading: [] }))).toEqual({});
  });
});

describe('toPayload', () => {
  it('trims the street and sends empty choices as null', () => {
    expect(toPayload(values({ streetName: '  Ulica 1 ' }))).toEqual({
      address: { streetName: 'Ulica 1', postalCodeId: 'pc1' },
      date: null,
      driverId: null,
      trailerId: null,
      disponentId: null,
      loadingCargoIds: [],
      unloadingCargoIds: [],
    });
  });

  it('sends the picked values and cargo ids', () => {
    const form = values({
      date: '2026-11-07',
      driverId: 'd1',
      trailerId: 't1',
      disponentId: 'p1',
      loading: [toFormCargo(cargo('c1'), shipment)],
      unloading: [toFormCargo(cargo('c2')), toFormCargo(cargo('c3'))],
    });
    expect(toPayload(form)).toEqual({
      address: { streetName: 'Ulica 1', postalCodeId: 'pc1' },
      date: '2026-11-07',
      driverId: 'd1',
      trailerId: 't1',
      disponentId: 'p1',
      loadingCargoIds: ['c1'],
      unloadingCargoIds: ['c2', 'c3'],
    });
  });

  it('sends an empty postal code id when none is picked', () => {
    expect(toPayload(values({ postalCode: null, date: '' })).address?.postalCodeId).toBe('');
    expect(toPayload(values({ date: '' })).date).toBeNull();
  });
});

describe('postalCodeLabel', () => {
  it.each([
    [{ postalCode: '48000', placeName: 'Koprivnica' }, '48000 Koprivnica'],
    [{ postalCode: '48000', placeName: null }, '48000'],
    [{ postalCode: '', placeName: 'Koprivnica' }, 'Koprivnica'],
  ])('%j → %s', (value, label) => expect(postalCodeLabel(value)).toBe(label));
});
