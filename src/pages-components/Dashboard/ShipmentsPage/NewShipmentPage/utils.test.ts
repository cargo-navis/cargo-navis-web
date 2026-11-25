import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ShipmentDraft } from '@/lib/api';
import { getPostalCode } from '@/lib/api/postalCodes';
import type { SuggestedNewClient } from '@/lib/api/shipment-drafts.d';

import type { Cargo, ShipmentFields } from './types.d';
import {
  fetchPostalCodeData,
  getSuggestedNewClient,
  transformFormDataToAgencyPayload,
  transformFormDataToPayload,
} from './utils';

vi.mock('@/lib/api/postalCodes', () => ({ getPostalCode: vi.fn() }));

const address = (streetName: string, value?: string) => ({
  streetName,
  countryCode: 'HR',
  postalCodeId: { value, label: value && `10000, Zagreb` },
});

const cargo = (overrides: Partial<Cargo> = {}): Cargo => ({
  weight: 12400,
  ldm: 8.8,
  metadata: { type: 'standard', palleteType: 'euro' as never, palleteAmount: 22 },
  loadingAddress: address('Ante Starčevića 32', 'pc1'),
  unloadingAddress: address('Lilienthalallee 25', 'pc2'),
  ...overrides,
});

const fields = (overrides: Partial<ShipmentFields> = {}): ShipmentFields => ({
  clientId: 'cl1',
  transportContractorId: 't1',
  price: 1850,
  notificationEmails: ['ana@podravka.hr'],
  cargo: [cargo()],
  ...overrides,
});

const cargoOf = (item: Cargo) => transformFormDataToPayload(fields({ cargo: [item] })).cargo[0];

describe('transformFormDataToPayload · nalog', () => {
  it('sends only the fields the form has', () => {
    expect(transformFormDataToPayload({} as ShipmentFields)).toEqual({});
    expect(transformFormDataToPayload(fields({ cargo: undefined as never }))).toEqual({
      clientId: 'cl1',
      transportContractorId: 't1',
      price: 1850,
      notificationEmails: ['ana@podravka.hr'],
    });
  });

  it('empties present text fields and recipients', () => {
    const payload = transformFormDataToPayload({
      ...fields({ cargo: undefined as never }),
      externalOrderReference: undefined,
      internalNote: undefined,
      externalNote: undefined,
      notificationEmails: undefined as never,
    });
    expect(payload).toMatchObject({ externalOrderReference: '', internalNote: '', externalNote: '' });
    expect(payload.notificationEmails).toEqual([]);
  });

  it('keeps a price of 0, drops an undefined one', () => {
    expect(transformFormDataToPayload(fields({ price: 0 })).price).toBe(0);
    expect(transformFormDataToPayload(fields({ price: undefined }))).not.toHaveProperty('price');
  });

  it('never sends the agency fields', () => {
    const payload = transformFormDataToPayload(fields({ isAgency: true, agencyPrice: 1500 }));
    expect(payload).not.toHaveProperty('isAgency');
    expect(payload).not.toHaveProperty('agencyPrice');
    expect(payload).not.toHaveProperty('contractorPrice');
  });

  it('adds the draft id only when given', () => {
    expect(transformFormDataToPayload(fields(), { draftId: 'd1' }).draftId).toBe('d1');
    expect(transformFormDataToPayload(fields(), { draftId: '' })).not.toHaveProperty('draftId');
    expect(transformFormDataToPayload(fields())).not.toHaveProperty('draftId');
  });
});

describe('transformFormDataToPayload · cargo', () => {
  it('sends the addresses as street + postal code id', () => {
    expect(cargoOf(cargo())).toEqual({
      weight: 12400,
      ldm: 8.8,
      loadingAddress: { streetName: 'Ante Starčevića 32', postalCodeId: 'pc1' },
      unloadingAddress: { streetName: 'Lilienthalallee 25', postalCodeId: 'pc2' },
      metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 22 },
    });
  });

  it('leaves out an incomplete address', () => {
    const item = cargoOf(cargo({ loadingAddress: address('', 'pc1'), unloadingAddress: address('Ulica 2') }));
    expect(item).not.toHaveProperty('loadingAddress');
    expect(item).not.toHaveProperty('unloadingAddress');
  });

  it('sends the cargo id only on edit', () => {
    expect(cargoOf(cargo({ id: 'cg1' })).id).toBe('cg1');
    expect(cargoOf(cargo())).not.toHaveProperty('id');
  });

  it('defaults a missing weight to 0', () => {
    expect(cargoOf(cargo({ weight: undefined })).weight).toBe(0);
  });

  it('empties present texts and dates', () => {
    expect(
      cargoOf(
        cargo({
          description: undefined,
          loadingCompanyName: undefined,
          unloadingCompanyName: '',
          loadingReadyDate: undefined,
          unloadingDueDate: '',
          loadingDescription: undefined,
          unloadingDescription: undefined,
          loadingReference: undefined,
          unloadingReference: undefined,
        })
      )
    ).toMatchObject({
      description: '',
      loadingCompanyName: '',
      unloadingCompanyName: '',
      loadingReadyDate: '',
      unloadingDueDate: '',
      loadingDescription: '',
      unloadingDescription: '',
      loadingReference: '',
      unloadingReference: '',
    });
  });

  it('passes the dates and references through', () => {
    expect(
      cargoOf(cargo({ loadingReadyDate: '2026-11-11', unloadingDueDate: '2026-11-13', loadingReference: 'UT-1' }))
    ).toMatchObject({ loadingReadyDate: '2026-11-11', unloadingDueDate: '2026-11-13', loadingReference: 'UT-1' });
  });

  it('pallets: only type, pallet type and amount', () => {
    expect(
      cargoOf(
        cargo({
          metadata: { type: 'standard', palleteType: 'jumbo' as never, palleteAmount: 3, width: 2, hasKolete: true },
        })
      ).metadata
    ).toEqual({ type: 'standard', palleteType: 'jumbo', palleteAmount: 3 });
    expect(cargoOf(cargo({ metadata: { type: 'standard', palleteAmount: 0 } })).metadata).toEqual({
      type: 'standard',
    });
  });

  it('oversize: the dimensions and pieces it has', () => {
    expect(
      cargoOf(
        cargo({
          metadata: { type: 'nonstandard', width: 2.1, height: 0, length: 4.2, palleteAmount: 2, hasKolete: true },
        })
      ).metadata
    ).toEqual({ type: 'nonstandard', width: 2.1, length: 4.2, palleteAmount: 2 });
  });

  it('no metadata without a known type', () => {
    expect(cargoOf(cargo({ metadata: undefined as never }))).not.toHaveProperty('metadata');
    expect(cargoOf(cargo({ metadata: { type: 'other' as never } }))).not.toHaveProperty('metadata');
  });
});

describe('transformFormDataToAgencyPayload', () => {
  it('sends the podvozar and its price on top of the nalog', () => {
    expect(
      transformFormDataToAgencyPayload(fields({ isAgency: true, transportContractorId: 'k1', agencyPrice: 1520.5 }), {
        draftId: 'd1',
      })
    ).toMatchObject({
      clientId: 'cl1',
      transportContractorId: 'k1',
      contractorPrice: 1520.5,
      price: 1850,
      draftId: 'd1',
    });
  });

  it('renames the podvozar price, no agency flags', () => {
    const payload = transformFormDataToAgencyPayload(fields({ isAgency: true, agencyPrice: 900 }));
    expect(payload.contractorPrice).toBe(900);
    expect(payload).not.toHaveProperty('agencyPrice');
    expect(payload).not.toHaveProperty('isAgency');
  });
});

describe('getSuggestedNewClient', () => {
  const client = (name: string) => ({ name, taxId: 'HR12345678901' }) as SuggestedNewClient;

  it('prefers the draft’s own suggestion, then the extracted one', () => {
    const draft = (own?: SuggestedNewClient | null, extracted?: SuggestedNewClient | null) =>
      ({ suggestedNewClient: own, aiExtractedData: { suggestedNewClient: extracted } }) as unknown as ShipmentDraft;
    expect(getSuggestedNewClient(draft(client('A'), client('B')))?.name).toBe('A');
    expect(getSuggestedNewClient(draft(null, client('B')))?.name).toBe('B');
    expect(getSuggestedNewClient(draft(null, null))).toBeUndefined();
  });

  it('is undefined without a draft or extracted data', () => {
    expect(getSuggestedNewClient()).toBeUndefined();
    expect(getSuggestedNewClient({} as ShipmentDraft)).toBeUndefined();
  });
});

describe('fetchPostalCodeData', () => {
  afterEach(() => {
    vi.mocked(getPostalCode).mockReset();
    vi.restoreAllMocks();
  });

  it('maps the postal code to a select option', async () => {
    vi.mocked(getPostalCode).mockResolvedValue({ id: 'pc1', postalCode: '48000', placeName: 'Koprivnica' } as never);
    await expect(fetchPostalCodeData('pc1')).resolves.toEqual({ value: 'pc1', label: '48000, Koprivnica' });
    expect(getPostalCode).toHaveBeenCalledWith('pc1');
  });

  it('returns an empty option when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getPostalCode).mockRejectedValue(new Error('404'));
    await expect(fetchPostalCodeData('pc1')).resolves.toEqual({});
  });
});
