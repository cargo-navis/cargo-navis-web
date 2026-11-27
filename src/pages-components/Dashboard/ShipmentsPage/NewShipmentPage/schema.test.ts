import { describe, expect, it } from 'vitest';
import { ValidationError } from 'yup';

import { NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';

import { cargoLoadUnloadDatesMessage, getAddressSchema, getShipmentSchema } from './schema';

const TENANT_ID = 't1';

const address = (streetName = 'Ulica 1', value = 'pc1') => ({
  streetName,
  countryCode: 'HR',
  postalCodeId: { value, label: `10000, Zagreb` },
});

type Fields = Record<string, unknown>;

const cargo = (overrides: Fields = {}, metadata: Fields = {}): Fields => ({
  weight: 12400,
  ldm: 8.8,
  loadingAddress: address(),
  unloadingAddress: address('Ulica 2', 'pc2'),
  loadingReadyDate: '2026-11-11',
  unloadingDueDate: '2026-11-13',
  metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 22, ...metadata },
  ...overrides,
});

const ownNalog = (overrides: Fields = {}): Fields => ({
  clientId: 'cl1',
  transportContractorId: TENANT_ID,
  price: 1850,
  isAgency: false,
  notificationEmails: [],
  cargo: [cargo()],
  ...overrides,
});

const agencyNalog = (overrides: Fields = {}): Fields =>
  ownNalog({ isAgency: true, transportContractorId: 'k1', agencyPrice: 1500, ...overrides });

/** Every error as `path: message`. */
function errorsOf(values: Fields) {
  try {
    getShipmentSchema(TENANT_ID).validateSync(values, { abortEarly: false });
    return [];
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return error.inner.map((inner) => `${inner.path}: ${inner.message}`);
  }
}

const castOf = (values: Fields) =>
  getShipmentSchema(TENANT_ID).validateSync(values, { abortEarly: false }) as unknown as Fields & {
    cargo: Fields[];
  };

describe('getShipmentSchema · nalog', () => {
  it('accepts a valid own and agency nalog', () => {
    expect(errorsOf(ownNalog())).toEqual([]);
    expect(errorsOf(agencyNalog())).toEqual([]);
  });

  it('needs a client', () => {
    expect(errorsOf(ownNalog({ clientId: '' }))).toContain('clientId: Odaberi klijenta.');
  });

  it.each([
    [undefined, 'Upiši cijenu.'],
    ['', 'Upiši cijenu.'],
    ['abc', 'Upiši cijenu.'],
    [0, 'Cijena mora biti veća od 0.'],
    [-10, 'Cijena mora biti veća od 0.'],
    [12.345, 'Najviše 2 decimale.'],
  ])('price %j → %s', (price, message) => {
    expect(errorsOf(ownNalog({ price }))).toEqual([`price: ${message}`]);
  });

  it.each([0.01, 12.3, 12.34, 1850, '99.99'])('price %j is fine', (price) => {
    expect(errorsOf(ownNalog({ price }))).toEqual([]);
  });

  it('caps the notification emails and checks each one', () => {
    expect(errorsOf(ownNalog({ notificationEmails: ['ana@podravka.hr', 'ana'] }))).toEqual([
      'notificationEmails[1]: Neispravan email.',
    ]);
    const emails = (count: number) => Array.from({ length: count }, (_, index) => `user${index}@firma.hr`);
    expect(errorsOf(ownNalog({ notificationEmails: emails(NOTIFICATION_EMAIL_LIMIT) }))).toEqual([]);
    expect(errorsOf(ownNalog({ notificationEmails: emails(NOTIFICATION_EMAIL_LIMIT + 1) }))).toEqual([
      `notificationEmails: Nalog može imati najviše ${NOTIFICATION_EMAIL_LIMIT} primatelja.`,
    ]);
  });

  it('needs the cargo list', () => {
    expect(errorsOf(ownNalog({ cargo: undefined }))).toEqual(['cargo: Dodaj barem jedan teret.']);
  });

  // Regression: Yup 1 `array().required()` accepted [] although the message says „at least one” (KAN-153).
  it('rejects an empty cargo list', () => {
    expect(errorsOf(ownNalog({ cargo: [] }))).toEqual(['cargo: Dodaj barem jedan teret.']);
  });
});

describe('getShipmentSchema · own nalog vs agency', () => {
  it('own nalog: the tenant is the podvozar or the client', () => {
    expect(errorsOf(ownNalog({ clientId: TENANT_ID, transportContractorId: 'k1' }))).toEqual([]);
  });

  it('own nalog: the tenant must take part', () => {
    expect(errorsOf(ownNalog({ transportContractorId: 'k1' }))).toEqual([
      'clientId: Tvoja tvrtka mora biti klijent ili podvozar.',
    ]);
  });

  it('own nalog: the tenant cannot be both', () => {
    expect(errorsOf(ownNalog({ clientId: TENANT_ID }))).toEqual([
      'clientId: Tvoja tvrtka ne može biti klijent na vlastitom prijevozu.',
    ]);
  });

  it('agency: the tenant is neither client nor podvozar', () => {
    expect(errorsOf(agencyNalog({ clientId: TENANT_ID }))).toEqual([
      'clientId: Tvoja tvrtka ne može biti klijent na agencijskom nalogu.',
    ]);
    expect(errorsOf(agencyNalog({ transportContractorId: TENANT_ID }))).toEqual([
      'transportContractorId: Tvoja tvrtka ne može biti podvozar na agencijskom nalogu.',
    ]);
  });

  it('agency: needs a podvozar', () => {
    expect(errorsOf(agencyNalog({ transportContractorId: '' }))).toEqual(['transportContractorId: Odaberi podvozara.']);
  });

  it.each([
    [undefined, 'Upiši cijenu podvozara.'],
    ['', 'Upiši cijenu podvozara.'],
    [null, 'Upiši cijenu podvozara.'],
    ['abc', 'Upiši cijenu podvozara.'],
    [0, 'Cijena mora biti veća od 0.'],
    [-1, 'Cijena mora biti veća od 0.'],
  ])('agency: podvozar price %j → %s', (agencyPrice, message) => {
    expect(errorsOf(agencyNalog({ agencyPrice }))).toEqual([`agencyPrice: ${message}`]);
  });

  it('own nalog: ignores and drops the podvozar price', () => {
    expect(errorsOf(ownNalog({ agencyPrice: '' }))).toEqual([]);
    expect(errorsOf(ownNalog({ agencyPrice: null }))).toEqual([]);
    expect(castOf(ownNalog({ agencyPrice: 1500 }))).not.toHaveProperty('agencyPrice');
  });
});

describe('getShipmentSchema · cargo', () => {
  const cargoErrors = (overrides: Fields, metadata: Fields = {}) =>
    errorsOf(ownNalog({ cargo: [cargo(overrides, metadata)] }));

  it.each([
    [undefined, 'Upiši težinu.'],
    ['', 'Upiši težinu.'],
    [0, 'Težina mora biti veća od 0.'],
    [-5, 'Težina mora biti veća od 0.'],
  ])('weight %j → %s', (weight, message) => {
    expect(cargoErrors({ weight })).toEqual([`cargo[0].weight: ${message}`]);
  });

  it('LDM is optional but positive', () => {
    expect(cargoErrors({ ldm: '' })).toEqual([]);
    expect(cargoErrors({ ldm: undefined })).toEqual([]);
    expect(cargoErrors({ ldm: 0 })).toEqual(['cargo[0].ldm: LDM mora biti veći od 0.']);
  });

  it('needs utovar and istovar', () => {
    // A missing object is filled with its defaults, so every empty field reports.
    expect(cargoErrors({ loadingAddress: undefined })).toEqual([
      'cargo[0].loadingAddress.streetName: Dodaj utovar.',
      'cargo[0].loadingAddress.postalCodeId.label: Dodaj utovar.',
      'cargo[0].loadingAddress.postalCodeId.value: Dodaj utovar.',
    ]);
    expect(cargoErrors({ unloadingAddress: { ...address(), streetName: '' } })).toEqual([
      'cargo[0].unloadingAddress.streetName: Dodaj istovar.',
    ]);
    expect(cargoErrors({ loadingAddress: address('Ulica 1', '') })).toEqual([
      'cargo[0].loadingAddress.postalCodeId.value: Dodaj utovar.',
    ]);
  });

  it('names the cargo index in the path', () => {
    expect(errorsOf(ownNalog({ cargo: [cargo(), cargo({ weight: 0 })] }))).toEqual([
      'cargo[1].weight: Težina mora biti veća od 0.',
    ]);
  });

  it('needs a cargo type', () => {
    expect(cargoErrors({ metadata: undefined })).toEqual(['cargo[0].metadata.type: Odaberi vrstu tereta.']);
    expect(cargoErrors({}, { type: undefined })).toEqual(['cargo[0].metadata.type: Odaberi vrstu tereta.']);
  });

  it.each([
    [{ palleteType: undefined }, 'cargo[0].metadata.palleteType: Odaberi vrstu palete.'],
    [{ palleteType: 'barrel' }, 'cargo[0].metadata.palleteType: Odaberi vrstu palete.'],
    [{ palleteAmount: undefined }, 'cargo[0].metadata.palleteAmount: Upiši broj paleta.'],
    [{ palleteAmount: '' }, 'cargo[0].metadata.palleteAmount: Upiši broj paleta.'],
    [{ palleteAmount: 0 }, 'cargo[0].metadata.palleteAmount: Najmanje 1 paleta.'],
  ])('pallets %j → error', (metadata, error) => {
    expect(cargoErrors({}, metadata)).toEqual([error]);
  });

  it('pallets: drops dimensions and kolete', () => {
    const [saved] = castOf(ownNalog({ cargo: [cargo({}, { width: 2, height: 1, length: 4, hasKolete: true })] })).cargo;
    expect(saved.metadata).toEqual({ type: 'standard', palleteType: 'euro', palleteAmount: 22 });
  });

  const oversize = (metadata: Fields) => ({ type: 'nonstandard', palleteType: undefined, ...metadata });

  it('oversize: pieces and dimensions are optional', () => {
    expect(cargoErrors({}, oversize({ palleteAmount: undefined, width: '', height: '', length: '' }))).toEqual([]);
  });

  it.each([
    [{ palleteAmount: 0 }, 'cargo[0].metadata.palleteAmount: Najmanje 1 komad.'],
    [{ palleteAmount: '' }, 'cargo[0].metadata.palleteAmount: Upiši broj koleta.'],
    [{ width: 0 }, 'cargo[0].metadata.width: Mora biti veće od 0.'],
    [{ height: -1 }, 'cargo[0].metadata.height: Mora biti veće od 0.'],
    [{ length: 0 }, 'cargo[0].metadata.length: Mora biti veće od 0.'],
  ])('oversize %j → error', (metadata, error) => {
    expect(cargoErrors({}, oversize(metadata))).toEqual([error]);
  });

  it('oversize: drops the pallet type, keeps kolete', () => {
    const [saved] = castOf(
      ownNalog({ cargo: [cargo({}, oversize({ palleteType: 'euro', hasKolete: true, width: 2.1 }))] })
    ).cargo;
    expect(saved.metadata).toEqual({ type: 'nonstandard', palleteAmount: 22, hasKolete: true, width: 2.1 });
  });
});

describe('getShipmentSchema · istovar date', () => {
  const dateErrors = (loadingReadyDate?: string, unloadingDueDate?: string) =>
    errorsOf(ownNalog({ cargo: [cargo({ loadingReadyDate, unloadingDueDate })] }));

  it('istovar before utovar names the utovar date', () => {
    expect(dateErrors('2026-11-11', '2026-11-10')).toEqual([
      'cargo[0].unloadingDueDate: Rok istovara ne može biti prije utovara (11.11.2026.).',
    ]);
  });

  it.each([
    ['same day', '2026-11-11', '2026-11-11'],
    ['same day, earlier hour', '2026-11-11T18:00', '2026-11-11T08:00'],
    ['after', '2026-11-11', '2026-11-12'],
    ['no utovar date', '', '2026-11-01'],
    ['blank utovar date', '  ', '2026-11-01'],
    ['no istovar date', '2026-11-11', ''],
    ['neither', undefined, undefined],
    ['invalid utovar date', 'nije datum', '2026-11-01'],
  ])('%s is fine', (_, loading, unloading) => {
    expect(dateErrors(loading, unloading)).toEqual([]);
  });

  it('across a year', () => {
    expect(dateErrors('2027-01-02', '2026-12-31')).toEqual([
      'cargo[0].unloadingDueDate: Rok istovara ne može biti prije utovara (2.1.2027.).',
    ]);
  });
});

describe('cargoLoadUnloadDatesMessage', () => {
  it('names the other date', () => {
    expect(cargoLoadUnloadDatesMessage('unloading', '2026-11-23')).toBe(
      'Rok istovara ne može biti prije utovara (23.11.2026.).'
    );
    expect(cargoLoadUnloadDatesMessage('loading', '2026-11-28')).toBe(
      'Utovar ne može biti nakon roka istovara (28.11.2026.).'
    );
  });
});

describe('getAddressSchema', () => {
  const schema = getAddressSchema({ message: 'Dodaj utovar.' });

  it('needs a street and a postal code', () => {
    expect(schema.isValidSync(address())).toBe(true);
    expect(() => schema.validateSync(undefined)).toThrow('Dodaj utovar.');
    expect(() => schema.validateSync({ ...address(), postalCodeId: undefined })).toThrow('Dodaj utovar.');
    expect(() => schema.validateSync({ ...address(), postalCodeId: { value: 'pc1', label: '' } })).toThrow(
      'Dodaj utovar.'
    );
  });

  it('country is optional', () => {
    expect(schema.isValidSync({ ...address(), countryCode: undefined })).toBe(true);
  });
});
