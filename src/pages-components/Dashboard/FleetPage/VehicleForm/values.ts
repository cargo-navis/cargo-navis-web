import dayjs from 'dayjs';

import { type EquipmentEnum, type UpdateVehicleParams, type Vehicle, type VehicleEnum } from '@/lib/api';

import { hasEngine, hasLoadSpace, hasNumber } from '../fleet';

/**
 * Form state for Novi / Uredi vozilo. Numbers are strings while typing („13,6”) and start empty when unknown (today's
 * form prefilled and saved 0); dates are 'YYYY-MM-DD' or ''.
 */

export const DATE_FIELDS = [
  'registrationDate',
  'registrationExpiryDate',
  'mandatoryInsuranceExpiryDate',
  'optionalInsuranceExpiryDate',
  'leasingExpiryDate',
  'technicalInspectionExpiryDate',
  'periodicalTechnicalInspectionExpiryDate',
  'smallServiceExpiryDate',
  'bigServiceExpiryDate',
  'tiresReplacementExpiryDate',
  'tachographExpiryDate',
  'fireExtinguisherCheckExpiryDate',
  'adrExpiryDate',
  'codeXlCertificateExpiryDate',
] as const;
export type DateField = (typeof DATE_FIELDS)[number];

const NUMBER_FIELDS = [
  'numberOfAxles',
  'emptyWeight',
  'enginePower',
  'tankSize',
  'averageFuelConsumption',
  'loadCapacity',
] as const;
export type NumberField = (typeof NUMBER_FIELDS)[number];

/**
 * Whole numbers: kg and axles. Dots and spaces typed in them are thousands separators (the list shows „27.000”), so
 * „27.000” is 27000, not 27.
 */
const INTEGER_FIELDS = new Set<NumberField>(['numberOfAxles', 'emptyWeight', 'loadCapacity']);
export const isIntegerField = (field: NumberField) => INTEGER_FIELDS.has(field);

const DIMENSION_FIELDS = ['length', 'width', 'height'] as const;
export type DimensionField = (typeof DIMENSION_FIELDS)[number];

export type VehicleFormValues = {
  registration: string;
  brand: string;
  vehicleIdentificationNumber: string;
  manufacturingYear: number | null;
  emissionStandard: string;
  vehicleLoadType: string;
  ramp: boolean;
  equipment: EquipmentEnum[];
} & Record<DateField, string> &
  Record<NumberField, string> &
  Record<DimensionField, string>;

/** Which fields a type has (engine fields not on a poluprikolica, load space not on a tegljač). */
const ENGINE_ONLY = new Set<string>([
  'emissionStandard',
  'enginePower',
  'tankSize',
  'averageFuelConsumption',
  'tachographExpiryDate',
  'fireExtinguisherCheckExpiryDate',
  'adrExpiryDate',
]);
const LOAD_SPACE_ONLY = new Set<string>([
  'vehicleLoadType',
  'loadCapacity',
  'codeXlCertificateExpiryDate',
  'ramp',
  'equipment',
  ...DIMENSION_FIELDS,
]);

export function fieldApplies(field: string, type: VehicleEnum) {
  if (ENGINE_ONLY.has(field)) return hasEngine(type);
  if (LOAD_SPACE_ONLY.has(field)) return hasLoadSpace(type);
  return true;
}

const numberText = (value: number | null | undefined) => (hasNumber(value) ? String(value).replace('.', ',') : '');
const dateText = (value: string | null | undefined) => (value ? dayjs(value).format('YYYY-MM-DD') : '');

export function toFormValues(vehicle?: Vehicle): VehicleFormValues {
  const dates = Object.fromEntries(DATE_FIELDS.map((field) => [field, dateText(vehicle?.[field])])) as Record<
    DateField,
    string
  >;
  const numbers = Object.fromEntries(
    NUMBER_FIELDS.map((field) => {
      const value = vehicle?.[field];
      return [field, numberText(isIntegerField(field) && hasNumber(value) ? Math.round(value) : value)];
    })
  ) as Record<NumberField, string>;
  return {
    registration: vehicle?.registration ?? '',
    brand: vehicle?.brand ?? '',
    vehicleIdentificationNumber: vehicle?.vehicleIdentificationNumber ?? '',
    manufacturingYear: vehicle?.manufacturingYear || null,
    emissionStandard: vehicle?.emissionStandard ?? '',
    vehicleLoadType: vehicle?.vehicleLoadType ?? '',
    ramp: vehicle?.ramp ?? false,
    equipment: vehicle?.equipment ?? [],
    ...dates,
    ...numbers,
    length: numberText(vehicle?.dimensions?.length),
    width: numberText(vehicle?.dimensions?.width),
    height: numberText(vehicle?.dimensions?.height),
  };
}

/**
 * Keeps what a number field may hold while typing: digits and one decimal separator (`,` or `.`). Whole-number
 * fields (`decimal: false`) keep only digits, so thousands separators („27.000”, „27 000”) drop out.
 */
export function cleanNumberInput(value: string, { decimal = true }: { decimal?: boolean } = {}) {
  const digits = value.replace(decimal ? /[^\d.,]/g : /\D/g, '');
  if (!decimal) return digits;
  const [whole, ...rest] = digits.split(/[.,]/);
  return rest.length ? `${whole},${rest.join('')}` : whole;
}

/** „13,6” → 13.6; '' → null. */
export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export type VehicleFormErrors = Partial<Record<'registration', string>>;

export function validate(values: VehicleFormValues): VehicleFormErrors {
  return {
    registration: values.registration.trim() ? undefined : 'Upiši registraciju.',
  };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The request body (+ `type`). New: every filled field of the type. Edit (`initial` given): only what changed, cleared
 * fields as null — as today's form, which sent its dirty fields. Dimensions go together, empty ones as 0 (today's).
 */
export function toPayload(values: VehicleFormValues, type: VehicleEnum, initial?: VehicleFormValues) {
  const payload: Record<string, unknown> = {};
  const changed = (field: keyof VehicleFormValues) => !initial || !same(values[field], initial[field]);
  const put = (field: keyof VehicleFormValues, value: unknown) => {
    if (!fieldApplies(field, type) || !changed(field)) return;
    // A new vehicle leaves out what wasn't filled.
    if (!initial && (value === null || value === '' || (Array.isArray(value) && value.length === 0))) return;
    payload[field] = value === '' ? null : value;
  };

  put('registration', values.registration.trim().toUpperCase());
  put('brand', values.brand.trim());
  put('vehicleIdentificationNumber', values.vehicleIdentificationNumber.trim().toUpperCase());
  put('manufacturingYear', values.manufacturingYear);
  put('emissionStandard', values.emissionStandard);
  put('vehicleLoadType', values.vehicleLoadType);
  for (const field of DATE_FIELDS) put(field, values[field]);
  for (const field of NUMBER_FIELDS) put(field, parseNumber(values[field]));
  if (fieldApplies('ramp', type) && (initial ? changed('ramp') : true)) payload.ramp = values.ramp;
  put('equipment', values.equipment);

  if (fieldApplies('length', type)) {
    const dimensionsChanged = DIMENSION_FIELDS.some((field) => changed(field));
    const anyFilled = DIMENSION_FIELDS.some((field) => parseNumber(values[field]) !== null);
    if (initial ? dimensionsChanged : anyFilled) {
      payload.dimensions = Object.fromEntries(
        DIMENSION_FIELDS.map((field) => [field, parseNumber(values[field]) ?? 0])
      );
    }
  }

  // Today's create and update both send the type.
  payload.type = type;
  return payload as UpdateVehicleParams;
}

export const isDirty = (values: VehicleFormValues, initial: VehicleFormValues) => !same(values, initial);
