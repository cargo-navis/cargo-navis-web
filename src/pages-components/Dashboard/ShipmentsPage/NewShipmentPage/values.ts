/**
 * Nalog form values (the form's own state) and the bridge to today's `ShipmentFields`: the yup schema (schema.ts) and
 * the payload transforms (utils.ts) are today's, so what reaches the API is what today's ShipmentForm sent. Numbers are
 * kept as the typed text („13,6”) and parsed on the way out; utovar / istovar are one object each (today's flat
 * `loading*` / `unloading*` fields), edited in a dialog.
 */

import type { Shipment, ShipmentDraft } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { roundLdmValue } from '@/lib/utils/math';
import { PalleteType, palleteValues } from '@/lib/utils/palletes';

import type { CargoType, ShipmentFields } from './types.d';

export type StopKind = 'loading' | 'unloading';

export interface StopAddress {
  streetName: string;
  countryCode: string;
  /** Today's select option: `value` = postal code id, `label` = „10000, Zagreb”. */
  postalCodeId: { label?: string; value?: string };
}

export interface StopValues {
  companyName: string;
  /** 'YYYY-MM-DD' (or what the API returned), '' when not set. */
  date: string;
  reference: string;
  description: string;
  address: StopAddress;
}

export interface CargoValues {
  /** React key; also the prefix of the cargo's field keys („c1.weight”). */
  key: string;
  /** Edit only: the saved cargo's id (copies and drafts create new cargo). */
  id?: string;
  type: CargoType;
  palleteType: PalleteType;
  /** Palete: number of pallets; Izvanredni teret: number of kolete (today's field for both). */
  palleteAmount: string;
  length: string;
  width: string;
  height: string;
  hasKolete: boolean;
  ldm: string;
  weight: string;
  description: string;
  loading: StopValues | null;
  unloading: StopValues | null;
}

export interface NalogValues {
  externalOrderReference: string;
  clientId: string;
  transportContractorId: string;
  price: string;
  isAgency: boolean;
  agencyPrice: string;
  internalNote: string;
  externalNote: string;
  notificationEmails: string[];
  cargo: CargoValues[];
}

// ---------------------------------------------------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------------------------------------------------

/** Digits and one decimal comma while typing („13.6” → „13,6”). */
export function cleanNumberInput(value: string, { decimal = true }: { decimal?: boolean } = {}) {
  const digits = value.replace(decimal ? /[^\d.,]/g : /\D/g, '');
  if (!decimal) return digits;
  const [whole, ...rest] = digits.split(/[.,]/);
  return rest.length ? `${whole},${rest.join('')}` : whole;
}

/** „13,6” → 13.6; '' → undefined. */
export function parseNumber(value: string | undefined): number | undefined {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** 13.6 → „13,6”; nothing → ''. */
export function numberText(value: number | null | undefined) {
  return value === undefined || value === null || !Number.isFinite(value) ? '' : String(value).replace('.', ',');
}

// ---------------------------------------------------------------------------------------------------------------------
// LDM
// ---------------------------------------------------------------------------------------------------------------------

/** Today's rule: pallets × the pallet's LDM, or length × width / 2,4 for oversize cargo. */
export function autoLdm(cargo: Pick<CargoValues, 'type' | 'palleteType' | 'palleteAmount' | 'length' | 'width'>) {
  if (cargo.type === 'standard') {
    const amount = parseNumber(cargo.palleteAmount);
    return amount ? roundLdmValue(palleteValues[cargo.palleteType] * amount) : undefined;
  }
  const length = parseNumber(cargo.length);
  const width = parseNumber(cargo.width);
  return length && width ? roundLdmValue((length * width) / 2.4) : undefined;
}

/** LDM follows pallets / dimensions until the user types their own (lab /nalog-form). */
export function isLdmAuto(cargo: CargoValues) {
  return !cargo.ldm.trim() || parseNumber(cargo.ldm) === autoLdm(cargo);
}

/** Applies a change to a teret, recomputing LDM while it is still the computed one. */
export function patchCargo(cargo: CargoValues, patch: Partial<CargoValues>): CargoValues {
  const next = { ...cargo, ...patch };
  if ('ldm' in patch || !isLdmAuto(cargo)) return next;
  return { ...next, ldm: numberText(autoLdm(next)) };
}

// ---------------------------------------------------------------------------------------------------------------------
// Empty values
// ---------------------------------------------------------------------------------------------------------------------

let keySeed = 0;
export const newCargoKey = () => `c${++keySeed}`;

export const emptyAddress = (): StopAddress => ({ streetName: '', countryCode: '', postalCodeId: {} });

export const emptyStop = (): StopValues => ({
  companyName: '',
  date: '',
  reference: '',
  description: '',
  address: emptyAddress(),
});

/** Number fields start empty (DECISIONS §2): no prefilled pallet count or LDM. */
export const emptyCargo = (): CargoValues => ({
  key: newCargoKey(),
  type: 'standard',
  palleteType: PalleteType.Euro,
  palleteAmount: '',
  length: '',
  width: '',
  height: '',
  hasKolete: false,
  ldm: '',
  weight: '',
  description: '',
  loading: null,
  unloading: null,
});

export const emptyNalog = (tenant: Tenant): NalogValues => ({
  externalOrderReference: '',
  clientId: '',
  transportContractorId: tenant.id,
  price: '',
  isAgency: false,
  agencyPrice: '',
  internalNote: '',
  externalNote: '',
  notificationEmails: [],
  cargo: [emptyCargo()],
});

/**
 * „Tko vozi?” as today's agency switch did it: own = the tenant is the contractor; agency = the tenant can be neither
 * the contractor nor the client.
 */
export function withAgency(values: NalogValues, isAgency: boolean, tenantId: string): NalogValues {
  if (isAgency) {
    return {
      ...values,
      isAgency,
      transportContractorId: values.transportContractorId === tenantId ? '' : values.transportContractorId,
      clientId: values.clientId === tenantId ? '' : values.clientId,
    };
  }
  return { ...values, isAgency, transportContractorId: tenantId };
}

// ---------------------------------------------------------------------------------------------------------------------
// From today's data (new / copy / draft / edit)
// ---------------------------------------------------------------------------------------------------------------------

/** The API's cargo (Shipment.cargo, or the partial one an AI draft holds). */
type ApiCargo = Partial<Shipment['cargo'][number]>;

/** „10000, Zagreb” for an address the API returned (today fetched the postal code; the address already has it). */
async function postalOption(
  address: Partial<Shipment['cargo'][number]['loadingAddress']> | undefined,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>
) {
  if (!address?.postalCodeId) return {};
  if (address.postalCode && address.placeName) {
    return { value: address.postalCodeId, label: `${address.postalCode}, ${address.placeName}` };
  }
  return fetchPostalCode(address.postalCodeId);
}

async function stopFromApi(
  cargo: ApiCargo,
  kind: StopKind,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>,
  { withDate }: { withDate: boolean }
): Promise<StopValues | null> {
  const address = kind === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress;
  if (!address?.streetName && !address?.postalCodeId) return null;
  const date = kind === 'loading' ? cargo.loadingReadyDate : cargo.unloadingDueDate;
  return {
    companyName: (kind === 'loading' ? cargo.loadingCompanyName : cargo.unloadingCompanyName) || '',
    date: withDate ? date || '' : '',
    reference: (kind === 'loading' ? cargo.loadingReference : cargo.unloadingReference) || '',
    description: (kind === 'loading' ? cargo.loadingDescription : cargo.unloadingDescription) || '',
    address: {
      streetName: address.streetName || '',
      countryCode: address.countryCode || '',
      postalCodeId: await postalOption(address, fetchPostalCode),
    },
  };
}

/**
 * Today's mapCargoItems: type from metadata (palete by default), Euro pallets by default, kolete when an oversize cargo
 * has a count. Edit keeps the cargo ids; a copy drops the dates (they belong to the original nalog).
 */
export async function cargoFromApi(
  items: ApiCargo[] | undefined,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>,
  { withIds = false, withDates = true }: { withIds?: boolean; withDates?: boolean } = {}
): Promise<CargoValues[]> {
  if (!items?.length) return [emptyCargo()];
  return Promise.all(
    items.map(async (item) => {
      const metadata = (item.metadata ?? {}) as Partial<Shipment['cargo'][number]['metadata']> & {
        width?: number;
        height?: number;
        length?: number;
        palleteAmount?: number;
      };
      const type: CargoType = metadata.type === 'nonstandard' ? 'nonstandard' : 'standard';
      const palleteAmount = metadata.palleteAmount || undefined;
      const palleteType = Object.values(PalleteType).includes(metadata.palleteType as PalleteType)
        ? (metadata.palleteType as PalleteType)
        : PalleteType.Euro;
      const [loading, unloading] = await Promise.all([
        stopFromApi(item, 'loading', fetchPostalCode, { withDate: withDates }),
        stopFromApi(item, 'unloading', fetchPostalCode, { withDate: withDates }),
      ]);
      const cargo: CargoValues = {
        key: newCargoKey(),
        ...(withIds && item.id ? { id: item.id } : {}),
        type,
        palleteType,
        palleteAmount: numberText(palleteAmount),
        length: numberText(metadata.length),
        width: numberText(metadata.width),
        height: numberText(metadata.height),
        hasKolete: type === 'nonstandard' && !!palleteAmount,
        ldm: numberText(item.ldm || undefined),
        weight: numberText(item.weight),
        description: item.description || '',
        loading,
        unloading,
      };
      // No LDM saved: start from the computed one, like a new teret.
      return cargo.ldm ? cargo : { ...cargo, ldm: numberText(autoLdm(cargo)) };
    })
  );
}

/** Copy: today's getCopyShipmentFormValues (recipients come from the client again, dates are left empty). */
export async function fromCopy(
  shipment: Shipment,
  tenant: Tenant,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>
): Promise<NalogValues> {
  const values: NalogValues = {
    externalOrderReference: shipment.externalOrderReference || '',
    clientId: shipment.clientId || '',
    transportContractorId: shipment.transportContractorId || '',
    price: numberText(shipment.price),
    // Today's copy started as an own nalog (the agency switch off).
    isAgency: false,
    agencyPrice: '',
    internalNote: shipment.internalNote || '',
    externalNote: shipment.externalNote || '',
    notificationEmails: [],
    cargo: await cargoFromApi(shipment.cargo, fetchPostalCode, { withDates: false }),
  };
  return withAgency(values, false, tenant.id);
}

/** Uredi: today's getEditShipmentFormValues (cargo ids kept, saved recipients). */
export async function fromEdit(
  shipment: Shipment,
  tenant: Tenant,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>
): Promise<NalogValues> {
  const values: NalogValues = {
    externalOrderReference: shipment.externalOrderReference || '',
    clientId: shipment.clientId || '',
    transportContractorId: shipment.transportContractorId || '',
    price: numberText(shipment.price),
    isAgency: !!shipment.isAgency,
    agencyPrice: numberText(shipment.contractorPrice),
    internalNote: shipment.internalNote || '',
    externalNote: shipment.externalNote || '',
    notificationEmails: shipment.notificationEmails ?? [],
    cargo: await cargoFromApi(shipment.cargo, fetchPostalCode, { withIds: true }),
  };
  return withAgency(values, values.isAgency, tenant.id);
}

/** Iz pripreme: today's getDraftShipmentFormValues (the AI's partial nalog, own by default). */
export async function fromDraft(
  draft: ShipmentDraft,
  tenant: Tenant,
  fetchPostalCode: (id: string) => Promise<{ label?: string; value?: string }>
): Promise<NalogValues> {
  const ai = draft.aiExtractedData ?? {};
  const values: NalogValues = {
    externalOrderReference: ai.externalOrderReference || '',
    clientId: ai.clientId || '',
    transportContractorId: ai.transportContractorId || tenant.id,
    price: numberText(ai.price),
    isAgency: false,
    agencyPrice: '',
    internalNote: ai.internalNote || '',
    externalNote: ai.externalNote || '',
    notificationEmails: [],
    cargo: await cargoFromApi(ai.cargo, fetchPostalCode),
  };
  return withAgency(values, false, tenant.id);
}

/** ✦ marks: the fields the AI filled (lab /nalog-form `DRAFT_AI_FIELDS`); each goes away once the field is changed. */
export function aiFieldsOf(values: NalogValues): Set<string> {
  const fields = new Set<string>();
  if (values.externalOrderReference) fields.add('externalOrderReference');
  if (values.clientId) fields.add('clientId');
  if (values.price) fields.add('price');
  if (values.internalNote) fields.add('internalNote');
  if (values.externalNote) fields.add('externalNote');
  for (const cargo of values.cargo) {
    for (const key of ['palleteAmount', 'length', 'width', 'height', 'ldm', 'weight', 'description'] as const) {
      if (cargo[key]) fields.add(`${cargo.key}.${key}`);
    }
    if (cargo.loading) fields.add(`${cargo.key}.loading`);
    if (cargo.unloading) fields.add(`${cargo.key}.unloading`);
  }
  return fields;
}

// ---------------------------------------------------------------------------------------------------------------------
// To today's ShipmentFields (validated by schema.ts, sent by utils.ts)
// ---------------------------------------------------------------------------------------------------------------------

function loadingFields(stop: StopValues | null) {
  const value = stop ?? emptyStop();
  return {
    loadingAddress: value.address,
    loadingCompanyName: value.companyName,
    loadingReadyDate: value.date,
    loadingDescription: value.description,
    loadingReference: value.reference,
  };
}

function unloadingFields(stop: StopValues | null) {
  const value = stop ?? emptyStop();
  return {
    unloadingAddress: value.address,
    unloadingCompanyName: value.companyName,
    unloadingDueDate: value.date,
    unloadingDescription: value.description,
    unloadingReference: value.reference,
  };
}

export function toShipmentFields(values: NalogValues): ShipmentFields {
  return {
    externalOrderReference: values.externalOrderReference,
    clientId: values.clientId,
    transportContractorId: values.transportContractorId,
    price: parseNumber(values.price),
    internalNote: values.internalNote,
    externalNote: values.externalNote,
    isAgency: values.isAgency,
    agencyPrice: parseNumber(values.agencyPrice),
    notificationEmails: values.notificationEmails,
    cargo: values.cargo.map((cargo) => ({
      ...(cargo.id ? { id: cargo.id } : {}),
      weight: parseNumber(cargo.weight),
      description: cargo.description,
      ldm: parseNumber(cargo.ldm) as number,
      metadata: {
        type: cargo.type,
        palleteType: cargo.palleteType,
        palleteAmount: cargo.type === 'standard' || cargo.hasKolete ? parseNumber(cargo.palleteAmount) : undefined,
        width: parseNumber(cargo.width),
        height: parseNumber(cargo.height),
        length: parseNumber(cargo.length),
        hasKolete: cargo.hasKolete,
      },
      ...loadingFields(cargo.loading),
      ...unloadingFields(cargo.unloading),
    })),
  };
}

/**
 * The form's field key for a yup error path: „cargo[1].metadata.palleteAmount” → „c7.palleteAmount”, anything under
 * a utovar / istovar → „c7.loading” / „c7.unloading” (shown on the stop block).
 */
export function fieldKeyOf(path: string | undefined, cargo: CargoValues[]): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('notificationEmails')) return 'notificationEmails';
  const match = /^cargo\[(\d+)\]\.?(.*)$/.exec(path);
  if (!match) return path;
  const item = cargo[Number(match[1])];
  if (!item) return 'cargo';
  const rest = match[2];
  if (rest.startsWith('loading')) return `${item.key}.loading`;
  if (rest.startsWith('unloading')) return `${item.key}.unloading`;
  if (rest.startsWith('metadata.')) return `${item.key}.${rest.slice('metadata.'.length)}`;
  return `${item.key}.${rest || 'metadata'}`;
}

/** Field keys in the order the form shows them (the first problem gets focus). */
export function fieldOrder(values: NalogValues): string[] {
  return [
    'clientId',
    'price',
    'externalOrderReference',
    'transportContractorId',
    'agencyPrice',
    'notificationEmails',
    ...values.cargo.flatMap((cargo) =>
      ['palleteType', 'palleteAmount', 'length', 'width', 'height', 'ldm', 'weight', 'loading', 'unloading'].map(
        (key) => `${cargo.key}.${key}`
      )
    ),
    'cargo',
  ];
}

/** The DOM id of a field key (the form uses `nf-` + the key with dots as dashes). */
export const fieldDomId = (key: string) => `nf-${key.replace(/\./g, '-')}`;
