import { describe, expect, it } from 'vitest';

import { EquipmentEnum, type Vehicle, VehicleEnum } from '@/lib/api';

import {
  cleanNumberInput,
  fieldApplies,
  isDirty,
  parseNumber,
  toFormValues,
  toPayload,
  validate,
  type VehicleFormValues,
} from './values';

const vehicle = (overrides: Partial<Vehicle> = {}): Vehicle =>
  ({
    id: 'v1',
    type: VehicleEnum.TRUCK,
    registration: 'KC 123-AB',
    brand: 'Volvo',
    vehicleIdentificationNumber: 'YV2RT40A5MB123456',
    equipment: [],
    ...overrides,
  }) as Vehicle;

const form = (overrides: Partial<VehicleFormValues> = {}): VehicleFormValues => ({
  ...toFormValues(),
  registration: 'KC 1-AB',
  ...overrides,
});

describe('fieldApplies', () => {
  it.each([
    ['enginePower', VehicleEnum.TRUCK, true],
    ['enginePower', VehicleEnum.SOLO_TRUCK, true],
    ['enginePower', VehicleEnum.VAN, true],
    ['enginePower', VehicleEnum.TRAILER, false],
    ['tachographExpiryDate', VehicleEnum.TRAILER, false],
    ['adrExpiryDate', VehicleEnum.TRAILER, false],
    ['emissionStandard', VehicleEnum.TRAILER, false],
    ['loadCapacity', VehicleEnum.TRUCK, false],
    ['loadCapacity', VehicleEnum.TRAILER, true],
    ['loadCapacity', VehicleEnum.SOLO_TRUCK, true],
    ['loadCapacity', VehicleEnum.VAN, true],
    ['ramp', VehicleEnum.TRUCK, false],
    ['equipment', VehicleEnum.TRUCK, false],
    ['length', VehicleEnum.TRUCK, false],
    ['height', VehicleEnum.VAN, true],
    ['codeXlCertificateExpiryDate', VehicleEnum.TRUCK, false],
    ['registration', VehicleEnum.TRAILER, true],
    ['registration', VehicleEnum.TRUCK, true],
    ['numberOfAxles', VehicleEnum.TRAILER, true],
    ['smallServiceExpiryDate', VehicleEnum.TRUCK, true],
  ])('%s on %s → %s', (field, type, applies) => expect(fieldApplies(field, type)).toBe(applies));
});

describe('toFormValues', () => {
  it('starts a new vehicle empty', () => {
    const values = toFormValues();
    expect(values.registration).toBe('');
    expect(values.manufacturingYear).toBeNull();
    expect(values.ramp).toBe(false);
    expect(values.equipment).toEqual([]);
    expect(values.registrationExpiryDate).toBe('');
    expect(values.loadCapacity).toBe('');
    expect([values.length, values.width, values.height]).toEqual(['', '', '']);
  });

  it('shows decimals with a comma', () => {
    const values = toFormValues(
      vehicle({ averageFuelConsumption: 28.5, dimensions: { length: 13.6, width: 2.48, height: 0, id: 'd' } })
    );
    expect(values.averageFuelConsumption).toBe('28,5');
    expect([values.length, values.width, values.height]).toEqual(['13,6', '2,48', '']);
  });

  it('treats year 0 as not entered', () => {
    expect(toFormValues(vehicle({ manufacturingYear: 0 })).manufacturingYear).toBeNull();
    expect(toFormValues(vehicle({ manufacturingYear: 2021 })).manufacturingYear).toBe(2021);
  });

  it('keeps ramp and equipment', () => {
    const values = toFormValues(vehicle({ ramp: true, equipment: [EquipmentEnum.STANCHIONS] }));
    expect(values.ramp).toBe(true);
    expect(values.equipment).toEqual([EquipmentEnum.STANCHIONS]);
  });
});

describe('cleanNumberInput / parseNumber', () => {
  it.each([
    ['', ''],
    ['abc', ''],
    [',5', ',5'],
    ['13,', '13,'],
    ['1.2.3', '1,23'],
  ])('cleans „%s” → „%s”', (input, cleaned) => expect(cleanNumberInput(input)).toBe(cleaned));

  it.each([
    ['  ', null],
    [' 7 ', 7],
    ['13.6', 13.6],
    [',5', 0.5],
    ['0', 0],
    ['abc', null],
    ['1,2,3', null],
  ])('parses „%s” → %s', (input, parsed) => expect(parseNumber(input)).toBe(parsed));
});

describe('validate', () => {
  it('requires the registration', () => {
    expect(validate(form({ registration: '   ' }))).toEqual({ registration: 'Upiši registraciju.' });
    expect(validate(form()).registration).toBeUndefined();
  });
});

describe('toPayload (new)', () => {
  it('uppercases and trims registration and VIN, trims brand', () => {
    const values = form({ registration: '  kc 1-ab ', vehicleIdentificationNumber: ' yv2rt40 ', brand: ' Volvo ' });
    expect(toPayload(values, VehicleEnum.TRUCK)).toEqual({
      registration: 'KC 1-AB',
      vehicleIdentificationNumber: 'YV2RT40',
      brand: 'Volvo',
      type: 'TRUCK',
    });
  });

  it('parses comma decimals', () => {
    expect(toPayload(form({ averageFuelConsumption: '28,5' }), VehicleEnum.TRUCK).averageFuelConsumption).toBe(28.5);
  });

  it('leaves out fields of other types', () => {
    const values = form({
      enginePower: '368',
      tachographExpiryDate: '2027-01-01',
      loadCapacity: '27000',
      codeXlCertificateExpiryDate: '2027-02-01',
      equipment: [EquipmentEnum.STANCHIONS],
      length: '13,6',
    });
    const trailer = toPayload(values, VehicleEnum.TRAILER);
    expect(trailer).not.toHaveProperty('enginePower');
    expect(trailer).not.toHaveProperty('tachographExpiryDate');
    expect(trailer).toMatchObject({
      loadCapacity: 27000,
      codeXlCertificateExpiryDate: '2027-02-01',
      equipment: [EquipmentEnum.STANCHIONS],
    });

    const truck = toPayload(values, VehicleEnum.TRUCK);
    expect(truck).toMatchObject({ enginePower: 368, tachographExpiryDate: '2027-01-01' });
    for (const field of ['loadCapacity', 'codeXlCertificateExpiryDate', 'equipment', 'ramp', 'dimensions']) {
      expect(truck).not.toHaveProperty(field);
    }
  });

  it('sends both engine and load space for a solo truck and a van', () => {
    const values = form({ enginePower: '200', loadCapacity: '3500' });
    for (const type of [VehicleEnum.SOLO_TRUCK, VehicleEnum.VAN]) {
      expect(toPayload(values, type)).toEqual({
        registration: 'KC 1-AB',
        enginePower: 200,
        loadCapacity: 3500,
        ramp: false,
        type,
      });
    }
  });

  it('sends year, dates and a set ramp', () => {
    const values = form({ manufacturingYear: 2021, registrationExpiryDate: '2027-06-14', ramp: true });
    expect(toPayload(values, VehicleEnum.TRAILER)).toEqual({
      registration: 'KC 1-AB',
      manufacturingYear: 2021,
      registrationExpiryDate: '2027-06-14',
      ramp: true,
      type: 'TRAILER',
    });
  });

  it('sends all dimensions when any is filled', () => {
    const values = form({ length: '13,6', width: '2,48', height: '2.7' });
    expect(toPayload(values, VehicleEnum.TRAILER).dimensions).toEqual({ length: 13.6, width: 2.48, height: 2.7 });
    expect(toPayload(form(), VehicleEnum.TRAILER)).not.toHaveProperty('dimensions');
  });
});

describe('toPayload (edit)', () => {
  const trailer = vehicle({
    type: VehicleEnum.TRAILER,
    loadCapacity: 27000,
    ramp: false,
    registrationExpiryDate: '2027-06-14',
    manufacturingYear: 2020,
    equipment: [EquipmentEnum.STANCHIONS],
    dimensions: { length: 13.6, width: 2.48, height: 2.7, id: 'd' },
  });
  const initial = toFormValues(trailer);

  it('sends only the type when nothing changed', () => {
    expect(toPayload(initial, VehicleEnum.TRAILER, initial)).toEqual({ type: 'TRAILER' });
  });

  it('sends cleared fields as null', () => {
    const values = { ...initial, registrationExpiryDate: '', manufacturingYear: null, loadCapacity: '', equipment: [] };
    expect(toPayload(values, VehicleEnum.TRAILER, initial)).toEqual({
      registrationExpiryDate: null,
      manufacturingYear: null,
      loadCapacity: null,
      equipment: [],
      type: 'TRAILER',
    });
  });

  it('sends a changed registration uppercased', () => {
    const values = { ...initial, registration: ' kc 9-zz ' };
    expect(toPayload(values, VehicleEnum.TRAILER, initial)).toEqual({ registration: 'KC 9-ZZ', type: 'TRAILER' });
  });

  it('sends the ramp only when it changed', () => {
    expect(toPayload({ ...initial, ramp: true }, VehicleEnum.TRAILER, initial)).toEqual({
      ramp: true,
      type: 'TRAILER',
    });
  });

  it('sends all dimensions when one changed, a cleared one as 0', () => {
    expect(toPayload({ ...initial, height: '' }, VehicleEnum.TRAILER, initial)).toEqual({
      dimensions: { length: 13.6, width: 2.48, height: 0 },
      type: 'TRAILER',
    });
  });

  it('ignores changes to fields the type does not have', () => {
    const values = { ...initial, enginePower: '400', tachographExpiryDate: '2027-01-01' };
    expect(toPayload(values, VehicleEnum.TRAILER, initial)).toEqual({ type: 'TRAILER' });
  });
});

describe('isDirty', () => {
  it('compares every value', () => {
    const initial = toFormValues(vehicle());
    expect(isDirty({ ...initial }, initial)).toBe(false);
    expect(isDirty({ ...initial, brand: 'Scania' }, initial)).toBe(true);
    expect(isDirty({ ...initial, equipment: [EquipmentEnum.STANCHIONS] }, initial)).toBe(true);
  });
});
