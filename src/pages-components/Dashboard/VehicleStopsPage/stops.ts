import dayjs from 'dayjs';

import type { StopKind } from '@/components/shared/stop-kind';
import type {
  UpdateVehicleStopParams,
  VehicleStop,
  VehicleStopCargo,
  VehicleStopCargoShipment,
} from '@/lib/api/vehicleStops';
import { getCargoLabel } from '@/lib/utils/cargo';
import { isStopCompleted } from '@/lib/utils/vehicleStops';

/**
 * Helpers over today's VehicleStop (lab /transports uses a simplified mock). A stop has no „kind” of its own: it is a
 * utovar when it loads cargo, an istovar when it unloads, both when it does both. The API returns a vehicle's stops in
 * route order, newest first.
 */

export const isDone = isStopCompleted;

/** Utovar and / or istovar, from the cargo the stop loads / unloads. Empty when it has no cargo yet. */
export function kindsOf(stop: VehicleStop): StopKind[] {
  const kinds: StopKind[] = [];
  if (stop.loadingCargos.length > 0) kinds.push('loading');
  if (stop.unloadingCargos.length > 0) kinds.push('unloading');
  return kinds;
}

const KIND_WORD: Record<StopKind, { nominative: string; genitive: string }> = {
  loading: { nominative: 'utovar', genitive: 'utovara' },
  unloading: { nominative: 'istovar', genitive: 'istovara' },
};

/** „utovar”, „istovar”, „utovar i istovar”, or „utovar / istovar” when it has no cargo yet. */
export function kindWord(stop: VehicleStop, grammaticalCase: 'nominative' | 'genitive' = 'nominative') {
  const kinds = kindsOf(stop);
  if (kinds.length === 0) return grammaticalCase === 'nominative' ? 'utovar / istovar' : 'utovara / istovara';
  return kinds.map((kind) => KIND_WORD[kind][grammaticalCase]).join(' i ');
}

/** „Koprivnica” (falls back to the postal code). */
export function placeOnly(stop: VehicleStop) {
  return stop.address?.placeName || stop.address?.postalCode || 'Bez adrese';
}

/** „48000 Koprivnica”. */
export function placeWithPostalCode(stop: VehicleStop) {
  const address = stop.address;
  if (!address) return 'Bez adrese';
  return [address.postalCode, address.placeName].filter(Boolean).join(' ');
}

/** Companies at this address (from the cargo: loading company for utovari, unloading company for istovari). */
export function companyOf(stop: VehicleStop) {
  const names = [
    ...stop.loadingCargos.map((cargo) => cargo.loadingCompanyName),
    ...stop.unloadingCargos.map((cargo) => cargo.unloadingCompanyName),
  ].filter((name): name is string => !!name);
  return Array.from(new Set(names)).join(', ');
}

export interface StopShipment {
  shipment: VehicleStopCargoShipment;
  kinds: StopKind[];
  /** „24 x EUR paleta, 2 x …”. */
  cargo: string;
}

/** The stop's cargo grouped per nalog („#2041/2026 Podravka d.d. · 33 pal”). */
export function shipmentsOf(stop: VehicleStop): StopShipment[] {
  const map = new Map<
    string,
    { shipment: VehicleStopCargoShipment; kinds: Set<StopKind>; cargos: VehicleStopCargo[] }
  >();
  const add = (cargo: VehicleStopCargo, kind: StopKind) => {
    const entry = map.get(cargo.shipment.id) ?? { shipment: cargo.shipment, kinds: new Set<StopKind>(), cargos: [] };
    entry.kinds.add(kind);
    entry.cargos.push(cargo);
    map.set(cargo.shipment.id, entry);
  };
  stop.loadingCargos.forEach((cargo) => add(cargo, 'loading'));
  stop.unloadingCargos.forEach((cargo) => add(cargo, 'unloading'));
  return Array.from(map.values()).map(({ shipment, kinds, cargos }) => ({
    shipment,
    kinds: Array.from(kinds),
    cargo: Array.from(new Set(cargos.map(getCargoLabel))).join(', '),
  }));
}

/** The stop's date as a local day (dates come as „2026-11-07”). */
export function dayOf(stop: VehicleStop) {
  return stop.date ? dayjs(stop.date).startOf('day') : null;
}

/** The API's date format. */
export function toApiDate(date: Date) {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * A full update with one thing changed: the same payload the stop form sends, so a quick edit (date, driver) never
 * relies on how the backend treats missing fields.
 */
export function toUpdatePayload(stop: VehicleStop, patch: UpdateVehicleStopParams = {}): UpdateVehicleStopParams {
  return {
    address: stop.address ? { streetName: stop.address.streetName, postalCodeId: stop.address.postalCodeId } : null,
    date: stop.date,
    driverId: stop.driverId,
    trailerId: stop.trailerId,
    disponentId: stop.disponentId,
    loadingCargoIds: stop.loadingCargos.map((cargo) => cargo.id),
    unloadingCargoIds: stop.unloadingCargos.map((cargo) => cargo.id),
    ...patch,
  };
}

/** Oldest first (the API sends newest first). */
export function chronological(stops: VehicleStop[]) {
  return stops.toReversed();
}
