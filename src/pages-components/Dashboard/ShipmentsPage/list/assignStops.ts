/**
 * Stop dates for assigning a nalog to a vehicle, as today's AssignVehicleModal builds them (copied here: PR 4 deletes
 * the modal). Cargos sharing an address make one stop; its date is the earliest of those cargos' ready / due dates.
 */

import type { Cargo, LoadingAddress } from '@/lib/api';
import type { CargoStopDate } from '@/lib/api/vehicleStops';
import { DateTimeFormat, formatDateString } from '@/lib/utils/date';

interface PreviewStop {
  key: string;
  loadingCargoIds: string[];
  unloadingCargoIds: string[];
}

function stopKey(address: Pick<LoadingAddress, 'postalCodeId' | 'streetName'>) {
  return `${address.postalCodeId}|${address.streetName}`;
}

function buildPreviewStops(cargos: Cargo[]): PreviewStop[] {
  const map = new Map<string, PreviewStop>();
  function add(address: LoadingAddress | undefined, cargoId: string, kind: 'loading' | 'unloading') {
    if (!address) return;
    const key = stopKey(address);
    const stop = map.get(key) ?? { key, loadingCargoIds: [], unloadingCargoIds: [] };
    stop[kind === 'loading' ? 'loadingCargoIds' : 'unloadingCargoIds'].push(cargoId);
    map.set(key, stop);
  }
  for (const cargo of cargos) {
    add(cargo.loadingAddress, cargo.id, 'loading');
    add(cargo.unloadingAddress, cargo.id, 'unloading');
  }
  return [...map.values()];
}

/** Each stop's date: the earliest loadingReadyDate / unloadingDueDate of its cargos (YYYY-MM-DD), or null. */
function buildDefaultDates(stops: PreviewStop[], cargoById: Map<string, Cargo>): Record<string, string | null> {
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

/** `cargoStopDates` for the assign call, plus whether some stop has no date (then the modal / page is needed). */
export function getAssignStopDates(cargos: Cargo[]): { cargoStopDates: CargoStopDate[]; missingDates: boolean } {
  const stops = buildPreviewStops(cargos);
  const dates = buildDefaultDates(stops, new Map(cargos.map((cargo) => [cargo.id, cargo])));
  return {
    cargoStopDates: cargos.map((cargo) => ({
      cargoId: cargo.id,
      loadingDate: cargo.loadingAddress ? (dates[stopKey(cargo.loadingAddress)] ?? null) : null,
      unloadingDate: cargo.unloadingAddress ? (dates[stopKey(cargo.unloadingAddress)] ?? null) : null,
    })),
    missingDates: stops.length === 0 || stops.some((stop) => !dates[stop.key]),
  };
}
