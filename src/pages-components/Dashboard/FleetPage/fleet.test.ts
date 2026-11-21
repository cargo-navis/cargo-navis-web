import { describe, expect, it } from 'vitest';

import { type Vehicle, VehicleEnum } from '@/lib/api';

import {
  deadlinesOf,
  expiredWord,
  formatDimensions,
  matchesVehicle,
  oldListRedirect,
  problemsOf,
  soonWord,
  specsOf,
  typeFromSlug,
} from './fleet';
import { cleanNumberInput, isIntegerField, parseNumber, toFormValues, toPayload } from './VehicleForm/values';

const NOW = new Date(2026, 10, 10);

const vehicle = (overrides: Partial<Vehicle>): Vehicle =>
  ({
    id: 'v1',
    type: VehicleEnum.TRUCK,
    registration: 'KC 123-AB',
    brand: 'Volvo',
    vehicleIdentificationNumber: 'YV2RT40A5MB123456',
    equipment: [],
    ...overrides,
  }) as Vehicle;

describe('Rokovi words (masculine)', () => {
  it.each([
    [1, 'istekao'],
    [2, 'istekla'],
    [4, 'istekla'],
    [5, 'isteklo'],
    [11, 'isteklo'],
    [21, 'istekao'],
  ])('%i rok → %s', (count, word) => expect(expiredWord(count)).toBe(word));

  it.each([
    [1, 'istječe'],
    [3, 'istječu'],
    [5, 'istječe'],
  ])('%i uskoro → %s', (count, word) => expect(soonWord(count)).toBe(word));
});

describe('deadlinesOf', () => {
  it('leaves out what the type does not have', () => {
    const truck = deadlinesOf(vehicle({ type: VehicleEnum.TRUCK }), NOW).map((deadline) => deadline.key);
    expect(truck).toContain('tachographExpiryDate');
    expect(truck).not.toContain('codeXlCertificateExpiryDate');

    const trailer = deadlinesOf(vehicle({ type: VehicleEnum.TRAILER }), NOW).map((deadline) => deadline.key);
    expect(trailer).toContain('codeXlCertificateExpiryDate');
    expect(trailer).not.toContain('tachographExpiryDate');
    expect(trailer).not.toContain('adrExpiryDate');
  });

  it('counts expired and soon (30 days ahead)', () => {
    const { expired, soon } = problemsOf(
      vehicle({
        registrationExpiryDate: '2026-11-02',
        tachographExpiryDate: '2026-11-20',
        technicalInspectionExpiryDate: '2027-06-14',
      }),
      NOW
    );
    expect(expired.map((deadline) => deadline.key)).toEqual(['registrationExpiryDate']);
    expect(soon.map((deadline) => deadline.key)).toEqual(['tachographExpiryDate']);
  });
});

describe('matchesVehicle', () => {
  const truck = vehicle({});
  it.each(['kc 123', 'KC123AB', 'kc123-ab', 'volvo', 'YV2RT40', ''])('finds „%s”', (query) =>
    expect(matchesVehicle(truck, query)).toBe(true)
  );
  it('misses other text', () => expect(matchesVehicle(truck, 'scania')).toBe(false));
});

describe('typeFromSlug', () => {
  it('reads ?vrsta=', () => {
    expect(typeFromSlug('poluprikolice')).toBe(VehicleEnum.TRAILER);
    expect(typeFromSlug('nope')).toBeUndefined();
    expect(typeFromSlug(undefined)).toBeUndefined();
  });

  it('sends old list URLs that look like an id to the tab', () => {
    expect(oldListRedirect('trailers')).toBe('/dashboard/fleet?vrsta=poluprikolice');
    expect(oldListRedirect('overview')).toBe('/dashboard/fleet');
    expect(oldListRedirect('3f2a-uuid')).toBeUndefined();
  });
});

describe('display helpers', () => {
  it('treats 0 as not entered', () => {
    expect(formatDimensions(vehicle({ dimensions: { length: 0, width: 0, height: 0, id: 'd' } }))).toBeUndefined();
    expect(formatDimensions(vehicle({ dimensions: { length: 13.6, width: 2.48, height: 0, id: 'd' } }))).toBe(
      '13,6 × 2,48 × –'
    );
  });

  it('builds header specs per type', () => {
    expect(specsOf(vehicle({ emissionStandard: 'EURO6', enginePower: 368 }))).toEqual(['Euro 6', '368 kW']);
    expect(
      specsOf(
        vehicle({
          type: VehicleEnum.TRAILER,
          vehicleLoadType: 'tilt_truck' as Vehicle['vehicleLoadType'],
          loadCapacity: 27000,
          dimensions: { length: 13.6, width: 2.48, height: 2.7, id: 'd' },
        })
      )
    ).toEqual(['Cerada', '27.000 kg', '13,6 m']);
  });
});

describe('form values', () => {
  it('cleans number input', () => {
    expect(cleanNumberInput('13.6')).toBe('13,6');
    expect(cleanNumberInput('1a2,3,4')).toBe('12,34');
    expect(cleanNumberInput('3,5', { decimal: false })).toBe('35');
    expect(parseNumber('13,6')).toBe(13.6);
    expect(parseNumber('')).toBeNull();
  });

  it('reads dots and spaces in kg fields as thousands separators', () => {
    expect(isIntegerField('loadCapacity')).toBe(true);
    expect(isIntegerField('averageFuelConsumption')).toBe(false);
    expect(cleanNumberInput('27.000', { decimal: false })).toBe('27000');
    expect(cleanNumberInput('27 000 kg', { decimal: false })).toBe('27000');
    const values = {
      ...toFormValues(),
      registration: 'KC 1-PP',
      loadCapacity: cleanNumberInput('27.000', { decimal: false }),
    };
    expect(toPayload(values, VehicleEnum.TRAILER).loadCapacity).toBe(27000);
    expect(toFormValues(vehicle({ emptyWeight: 7400.6 })).emptyWeight).toBe('7401');
  });

  it('starts empty instead of 0', () => {
    const values = toFormValues(vehicle({ enginePower: 0, emptyWeight: 7400, registrationDate: '2021-06-14' }));
    expect(values.enginePower).toBe('');
    expect(values.emptyWeight).toBe('7400');
    expect(values.registrationDate).toBe('2021-06-14');
  });

  it('new: sends only filled fields of the type', () => {
    const values = { ...toFormValues(), registration: 'kc 1-ab', enginePower: '368', loadCapacity: '1000' };
    expect(toPayload(values, VehicleEnum.TRUCK)).toEqual({ registration: 'KC 1-AB', enginePower: 368, type: 'TRUCK' });
  });

  it('new trailer: ramp + dimensions together', () => {
    const values = { ...toFormValues(), registration: 'KC 1-PP', length: '13,6' };
    expect(toPayload(values, VehicleEnum.TRAILER)).toEqual({
      registration: 'KC 1-PP',
      ramp: false,
      dimensions: { length: 13.6, width: 0, height: 0 },
      type: 'TRAILER',
    });
  });

  it('edit: sends what changed, cleared as null', () => {
    const initial = toFormValues(vehicle({ enginePower: 368, tankSize: 900 }));
    const values = { ...initial, enginePower: '', tankSize: '1000' };
    expect(toPayload(values, VehicleEnum.TRUCK, initial)).toEqual({ enginePower: null, tankSize: 1000, type: 'TRUCK' });
  });
});
