/**
 * The nalog's stops when assigning it to a vehicle, as today's AssignVehicleModal built them (shared by the Nalozi
 * quick-assign popover and the Dodijeli vozilo page). Cargos sharing an address make one stop; its date is the earliest
 * of those cargos' ready / due dates. Loading stops first, unloading-only stops after.
 */

import type { Cargo, LoadingAddress } from '@/lib/api';
import type { CargoStopDate } from '@/lib/api/vehicleStops';
import { DateTimeFormat, formatDateString } from '@/lib/utils/date';

export interface AssignStop {
  key: string;
  address: LoadingAddress;
  /** The first company name given for this address (utovar / istovar company). */
  companyName?: string;
  loadingCargoIds: string[];
  unloadingCargoIds: string[];
}

function stopKey(address: Pick<LoadingAddress, 'postalCodeId' | 'streetName'>) {
  return `${address.postalCodeId}|${address.streetName}`;
}

export function buildAssignStops(cargos: Cargo[]): AssignStop[] {
  const map = new Map<string, AssignStop>();
  function add(address: LoadingAddress | undefined, cargo: Cargo, kind: 'loading' | 'unloading') {
    if (!address) return;
    const key = stopKey(address);
    const stop = map.get(key) ?? { key, address, loadingCargoIds: [], unloadingCargoIds: [] };
    stop[kind === 'loading' ? 'loadingCargoIds' : 'unloadingCargoIds'].push(cargo.id);
    stop.companyName ||= (kind === 'loading' ? cargo.loadingCompanyName : cargo.unloadingCompanyName) || undefined;
    map.set(key, stop);
  }
  for (const cargo of cargos) {
    add(cargo.loadingAddress, cargo, 'loading');
    add(cargo.unloadingAddress, cargo, 'unloading');
  }
  const loadingFirst = (stop: AssignStop) => (stop.loadingCargoIds.length > 0 ? 0 : 1);
  return [...map.values()].sort((a, b) => loadingFirst(a) - loadingFirst(b));
}

/** Each stop's date: the earliest loadingReadyDate / unloadingDueDate of its cargos (YYYY-MM-DD), or null. */
export function defaultStopDates(stops: AssignStop[], cargos: Cargo[]): Record<string, string | null> {
  const cargoById = new Map(cargos.map((cargo) => [cargo.id, cargo]));
  return Object.fromEntries(
    stops.map((stop) => {
      const dates = [
        ...stop.loadingCargoIds.map((id) => cargoById.get(id)?.loadingReadyDate),
        ...stop.unloadingCargoIds.map((id) => cargoById.get(id)?.unloadingDueDate),
      ]
        .filter((date): date is string => !!date)
        .map((date) => formatDateString(date, DateTimeFormat.IsoShort))
        .sort();
      return [stop.key, dates[0] ?? null];
    })
  );
}

/** `cargoStopDates` for the assign call from one date per stop. */
export function cargoStopDatesFor(cargos: Cargo[], dates: Record<string, string | null>): CargoStopDate[] {
  return cargos.map((cargo) => ({
    cargoId: cargo.id,
    loadingDate: cargo.loadingAddress ? (dates[stopKey(cargo.loadingAddress)] ?? null) : null,
    unloadingDate: cargo.unloadingAddress ? (dates[stopKey(cargo.unloadingAddress)] ?? null) : null,
  }));
}

/** `cargoStopDates` for the assign call, plus whether some stop has no date (then the page is needed). */
export function getAssignStopDates(cargos: Cargo[]): { cargoStopDates: CargoStopDate[]; missingDates: boolean } {
  const stops = buildAssignStops(cargos);
  const dates = defaultStopDates(stops, cargos);
  return {
    cargoStopDates: cargoStopDatesFor(cargos, dates),
    missingDates: stops.length === 0 || stops.some((stop) => !dates[stop.key]),
  };
}
