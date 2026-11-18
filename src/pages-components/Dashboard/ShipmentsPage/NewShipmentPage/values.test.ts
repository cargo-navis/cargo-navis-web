import { describe, expect, it } from 'vitest';

import type { Shipment, ShipmentDraft } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';

import { getShipmentSchema } from './schema';
import type { ShipmentFields } from './types.d';
import { transformFormDataToAgencyPayload, transformFormDataToPayload } from './utils';
import {
  autoLdm,
  cleanNumberInput,
  emptyCargo,
  emptyNalog,
  fieldKeyOf,
  fromCopy,
  fromDraft,
  fromEdit,
  type NalogValues,
  parseNumber,
  patchCargo,
  toShipmentFields,
  withAgency,
} from './values';

const TENANT = { id: 't1', name: 'Prijevoz Horvat d.o.o.' } as Tenant;
const fetchPostalCode = async (id: string) => ({ value: id, label: `fetched, ${id}` });

const address = (postalCodeId: string, streetName: string, postalCode: string, placeName: string) => ({
  streetName,
  postalCodeId,
  postalCode,
  placeName,
  countryCode: 'HR',
});

const SHIPMENT = {
  id: 's1',
  orderNumber: '2041/2026',
  externalOrderReference: 'PO-1',
  clientId: 'cl1',
  transportContractorId: 't1',
  price: 1850,
  internalNote: 'Interna',
  externalNote: '',
  isAgency: false,
  contractorPrice: null,
  notificationEmails: ['ana@podravka.hr'],
  cargo: [
    {
      id: 'cg1',
      weight: 12400,
      description: 'Hrana',
      ldm: 8.8,
      metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 22, width: 0, height: 0, length: 0 },
      loadingAddress: address('pc1', 'Ante Starčevića 32', '48000', 'Koprivnica'),
      loadingCompanyName: 'Podravka',
      loadingReadyDate: '2026-11-11',
      loadingReference: 'UT-1',
      loadingDescription: 'Rampa 4',
      unloadingAddress: address('pc2', 'Lilienthalallee 25', '80939', 'München'),
      unloadingCompanyName: 'Podravka DE',
      unloadingDueDate: '2026-11-13',
      unloadingReference: '',
      unloadingDescription: '',
    },
  ],
} as unknown as Shipment;

/** What today's ShipmentForm did on submit: the schema's cast values through the transform. */
function payloadOf(values: NalogValues, { agency = false, draftId }: { agency?: boolean; draftId?: string } = {}) {
  const data = getShipmentSchema(TENANT.id).validateSync(toShipmentFields(values), {
    abortEarly: false,
  }) as ShipmentFields;
  return agency ? transformFormDataToAgencyPayload(data, { draftId }) : transformFormDataToPayload(data, { draftId });
}

const savedCargo = {
  weight: 12400,
  ldm: 8.8,
  description: 'Hrana',
  loadingAddress: { streetName: 'Ante Starčevića 32', postalCodeId: 'pc1' },
  unloadingAddress: { streetName: 'Lilienthalallee 25', postalCodeId: 'pc2' },
  loadingCompanyName: 'Podravka',
  unloadingCompanyName: 'Podravka DE',
  loadingReadyDate: '2026-11-11',
  unloadingDueDate: '2026-11-13',
  loadingDescription: 'Rampa 4',
  unloadingDescription: '',
  loadingReference: 'UT-1',
  unloadingReference: '',
  metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 22 },
};

describe('Nalog form → today’s payload', () => {
  it('edit sends the saved nalog back unchanged (cargo ids, recipients, dates)', async () => {
    const values = await fromEdit(SHIPMENT, TENANT, fetchPostalCode);
    expect(payloadOf(values)).toEqual({
      externalOrderReference: 'PO-1',
      clientId: 'cl1',
      transportContractorId: 't1',
      price: 1850,
      internalNote: 'Interna',
      externalNote: '',
      notificationEmails: ['ana@podravka.hr'],
      cargo: [{ id: 'cg1', ...savedCargo }],
    });
  });

  it('copy drops cargo ids, dates and recipients and makes an own nalog', async () => {
    const values = await fromCopy(
      { ...SHIPMENT, isAgency: true, transportContractorId: 'k1' },
      TENANT,
      fetchPostalCode
    );
    expect(values.isAgency).toBe(false);
    expect(values.transportContractorId).toBe('t1');
    expect(payloadOf(values)).toEqual({
      externalOrderReference: 'PO-1',
      clientId: 'cl1',
      transportContractorId: 't1',
      price: 1850,
      internalNote: 'Interna',
      externalNote: '',
      notificationEmails: [],
      cargo: [{ ...savedCargo, loadingReadyDate: '', unloadingDueDate: '' }],
    });
  });

  it('agency create sends the kontraktor, its price and the draft id', async () => {
    const draft = {
      id: 'd1',
      status: 'EXTRACTED',
      aiExtractedData: { ...SHIPMENT, id: undefined, notificationEmails: undefined },
    } as unknown as ShipmentDraft;
    const values = await fromDraft(draft, TENANT, fetchPostalCode);
    const agency = { ...withAgency(values, true, TENANT.id), transportContractorId: 'k1', agencyPrice: '1520,5' };
    expect(payloadOf(agency, { agency: true, draftId: 'd1' })).toEqual({
      externalOrderReference: 'PO-1',
      clientId: 'cl1',
      transportContractorId: 'k1',
      contractorPrice: 1520.5,
      price: 1850,
      internalNote: 'Interna',
      externalNote: '',
      notificationEmails: [],
      draftId: 'd1',
      cargo: [savedCargo],
    });
  });

  it('oversize cargo sends its dimensions and kolete', () => {
    const values: NalogValues = {
      ...emptyNalog(TENANT),
      clientId: 'cl1',
      price: '900',
      cargo: [
        {
          ...emptyCargo(),
          type: 'nonstandard',
          length: '4,2',
          width: '2,1',
          height: '1,8',
          hasKolete: true,
          palleteAmount: '2',
          ldm: '3,68',
          weight: '3100',
          loading: {
            companyName: '',
            date: '',
            reference: '',
            description: '',
            address: {
              streetName: 'Ulica 1',
              countryCode: 'HR',
              postalCodeId: { value: 'pc1', label: '10000, Zagreb' },
            },
          },
          unloading: {
            companyName: '',
            date: '',
            reference: '',
            description: '',
            address: {
              streetName: 'Ulica 2',
              countryCode: 'HR',
              postalCodeId: { value: 'pc2', label: '21000, Split' },
            },
          },
        },
      ],
    };
    expect(payloadOf(values).cargo[0].metadata).toEqual({
      type: 'nonstandard',
      width: 2.1,
      height: 1.8,
      length: 4.2,
      palleteAmount: 2,
    });
  });
});

describe('Nalog form values', () => {
  it('own nalog: the tenant drives; agency: the tenant is neither kontraktor nor client', () => {
    const own = emptyNalog(TENANT);
    expect(own.transportContractorId).toBe('t1');
    const agency = withAgency({ ...own, clientId: 't1' }, true, TENANT.id);
    expect(agency).toMatchObject({ isAgency: true, transportContractorId: '', clientId: '' });
    expect(withAgency({ ...agency, transportContractorId: 'k1' }, false, TENANT.id).transportContractorId).toBe('t1');
  });

  it('LDM follows pallets until typed', () => {
    let cargo = patchCargo(emptyCargo(), { palleteAmount: '10' });
    expect(cargo.ldm).toBe('4');
    cargo = patchCargo(cargo, { palleteType: 'jumbo' as never });
    expect(cargo.ldm).toBe('6');
    cargo = patchCargo(cargo, { ldm: '7,5' });
    cargo = patchCargo(cargo, { palleteAmount: '12' });
    expect(cargo.ldm).toBe('7,5');
    expect(autoLdm({ ...cargo, type: 'nonstandard', length: '4,8', width: '2,4' })).toBe(4.8);
  });

  it('numbers keep a decimal comma', () => {
    expect(cleanNumberInput('13.6')).toBe('13,6');
    expect(cleanNumberInput('1a2,5,1')).toBe('12,51');
    expect(parseNumber('13,6')).toBe(13.6);
    expect(parseNumber('')).toBeUndefined();
  });

  it('maps schema paths to the form’s fields', () => {
    const cargo = [{ ...emptyCargo(), key: 'c9' }];
    expect(fieldKeyOf('cargo[0].metadata.palleteAmount', cargo)).toBe('c9.palleteAmount');
    expect(fieldKeyOf('cargo[0].loadingAddress.streetName', cargo)).toBe('c9.loading');
    expect(fieldKeyOf('cargo[0].unloadingDueDate', cargo)).toBe('c9.unloading');
    expect(fieldKeyOf('notificationEmails[2]', cargo)).toBe('notificationEmails');
    expect(fieldKeyOf('price', cargo)).toBe('price');
  });

  it('an empty new nalog lists every problem with the lab’s words', () => {
    try {
      getShipmentSchema(TENANT.id).validateSync(toShipmentFields(emptyNalog(TENANT)), { abortEarly: false });
      expect.unreachable();
    } catch (error) {
      const messages = (error as { errors: string[] }).errors;
      expect(messages).toEqual(
        expect.arrayContaining([
          'Odaberi klijenta.',
          'Upiši cijenu.',
          'Upiši broj paleta.',
          'Upiši težinu.',
          'Dodaj utovar.',
          'Dodaj istovar.',
        ])
      );
    }
  });
});
