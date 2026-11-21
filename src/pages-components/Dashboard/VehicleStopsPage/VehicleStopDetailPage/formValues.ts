import type { Cargo } from '@/lib/api';
import type { CreateVehicleStopParams, VehicleStop, VehicleStopCargoShipment } from '@/lib/api/vehicleStops';
import { getCargoLabel } from '@/lib/utils/cargo';

import { buildAddressKey } from './addressHelpers';

/** A teret on the form: enough to show „#2041/2026 Podravka d.d. · 33 x EUR paleta” and send its id. */
export interface FormCargo {
  id: string;
  shipment: VehicleStopCargoShipment | null;
  label: string;
}

export interface FormPostalCode {
  id: string;
  postalCode: string;
  placeName: string | null;
  countryCode: string | null;
}

/** Today's stop form (VehicleStopForm) as plain values. */
export interface StopFormValues {
  /** Search over the addresses of active nalozi, or type a custom one. */
  addressMode: 'search' | 'custom';
  /** The picked search option (shipment + postal code). */
  addressKey: string | null;
  streetName: string;
  countryCode: string;
  postalCode: FormPostalCode | null;
  /** „2026-11-07”. */
  date: string | null;
  driverId: string;
  trailerId: string;
  disponentId: string;
  loading: FormCargo[];
  unloading: FormCargo[];
}

export function toFormCargo(
  cargo: Pick<Cargo, 'id' | 'metadata'> & { description?: string | null },
  shipment?: VehicleStopCargoShipment | null
): FormCargo {
  return { id: cargo.id, shipment: shipment ?? null, label: getCargoLabel(cargo) };
}

/** New stop: driver, trailer and disponent carry over from the stop before it (today's rule). */
export function newStopValues(previousStop?: VehicleStop): StopFormValues {
  return {
    addressMode: 'search',
    addressKey: null,
    streetName: '',
    countryCode: '',
    postalCode: null,
    date: null,
    driverId: previousStop?.driverId ?? '',
    trailerId: previousStop?.trailerId ?? '',
    disponentId: previousStop?.disponentId ?? '',
    loading: [],
    unloading: [],
  };
}

export function editStopValues(stop: VehicleStop): StopFormValues {
  const { address } = stop;
  return {
    addressMode: 'search',
    addressKey: address ? buildAddressKey(stop.id, address.postalCodeId) : null,
    streetName: address?.streetName ?? '',
    countryCode: address?.countryCode ?? '',
    postalCode: address
      ? {
          id: address.postalCodeId,
          postalCode: address.postalCode,
          placeName: address.placeName,
          countryCode: address.countryCode,
        }
      : null,
    date: stop.date,
    driverId: stop.driverId ?? '',
    trailerId: stop.trailerId ?? '',
    disponentId: stop.disponentId ?? '',
    loading: stop.loadingCargos.map((cargo) => toFormCargo(cargo, cargo.shipment)),
    unloading: stop.unloadingCargos.map((cargo) => toFormCargo(cargo, cargo.shipment)),
  };
}

export type StopFormField = 'address' | 'streetName' | 'postalCode';

/** Only the address is required (today's schema). */
export function validateStop(values: StopFormValues): Partial<Record<StopFormField, string>> {
  const errors: Partial<Record<StopFormField, string>> = {};
  if (values.addressMode === 'search') {
    if (!values.postalCode || !values.streetName.trim()) errors.address = 'Odaberi adresu ili upiši prilagođenu.';
  } else {
    if (!values.streetName.trim()) errors.streetName = 'Upiši ulicu i broj.';
    if (!values.postalCode) errors.postalCode = 'Odaberi poštanski broj.';
  }
  return errors;
}

export function toPayload(values: StopFormValues): Omit<CreateVehicleStopParams, 'vehicleId'> {
  return {
    address: { streetName: values.streetName.trim(), postalCodeId: values.postalCode?.id ?? '' },
    date: values.date || null,
    driverId: values.driverId || null,
    trailerId: values.trailerId || null,
    disponentId: values.disponentId || null,
    loadingCargoIds: values.loading.map((cargo) => cargo.id),
    unloadingCargoIds: values.unloading.map((cargo) => cargo.id),
  };
}

/** „48000 Koprivnica”. */
export function postalCodeLabel(postalCode: Pick<FormPostalCode, 'postalCode' | 'placeName'>) {
  return [postalCode.postalCode, postalCode.placeName].filter(Boolean).join(' ');
}
