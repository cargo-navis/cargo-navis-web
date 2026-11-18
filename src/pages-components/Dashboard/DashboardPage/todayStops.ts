import dayjs from 'dayjs';

import { LoadStatus } from '@/lib/api/shipments';
import type { Cargo, Shipment } from '@/lib/api/shipments.d';
import type { VehicleStop } from '@/lib/api/vehicleStops.d';

export type StopKind = 'utovar' | 'istovar';

/** One row of „Danas”: a nalog's utovar or istovar today at one place (its tereti there summed up). */
export interface TodayStop {
  id: string;
  kind: StopKind;
  shipmentId: string;
  orderNumber: string;
  clientId?: string;
  /** Agency nalog: the contractor does the transport, no vehicle of ours. */
  isAgency: boolean;
  contractorId?: string;
  countryCode?: string;
  /** „10000 Zagreb” */
  place: string;
  /** „33 pal · 18,4 t”, „13,6 LDM · 22 t” */
  cargo: string;
  vehicleId?: string;
  driverId?: string;
  done: boolean;
}

const decimal = (value: number) => value.toLocaleString('hr-HR', { maximumFractionDigits: 1 });

/** Pallets first (standard cargo), else LDM; then the weight in tonnes. */
export function summarizeCargo(cargos: Pick<Cargo, 'weight' | 'ldm' | 'metadata'>[]) {
  const pallets = cargos.reduce(
    (sum, cargo) => sum + (cargo.metadata?.type === 'standard' ? (cargo.metadata.palleteAmount ?? 0) : 0),
    0
  );
  const ldm = cargos.reduce((sum, cargo) => sum + (cargo.ldm ?? 0), 0);
  const kg = cargos.reduce((sum, cargo) => sum + (cargo.weight ?? 0), 0);
  const parts = [pallets > 0 ? `${pallets} pal` : ldm > 0 ? `${decimal(ldm)} LDM` : undefined];
  if (kg > 0) parts.push(`${decimal(kg / 1000)} t`);
  return parts.filter(Boolean).join(' · ') || '—';
}

const stopCargoIds = (stop: VehicleStop, kind: StopKind) =>
  (kind === 'utovar' ? stop.loadingCargos : stop.unloadingCargos)?.map((cargo) => cargo.id) ?? [];

/** Done when the vehicle stop is confirmed; without a stop (agency) from the cargo's load status. */
function isCargoDone(cargo: Cargo, kind: StopKind, stop: VehicleStop | undefined) {
  if (stop) return Boolean(stop.completedAt);
  if (kind === 'utovar') return cargo.loadStatus === LoadStatus.Loaded || cargo.loadStatus === LoadStatus.Unloaded;
  return cargo.loadStatus === LoadStatus.Unloaded;
}

/**
 * Today's utovari and istovari from the two Nalozi queries (loading today, unloading today), merged by id. Each nalog
 * gives one row per kind and place; finished rows go after the open ones (dimmed in the list).
 */
export function buildTodayStops(shipments: Shipment[], today: Date = new Date()): TodayStop[] {
  const isToday = (date?: string) => !!date && dayjs(date).isSame(today, 'day');
  const unique = [...new Map(shipments.map((shipment) => [shipment.id, shipment])).values()];
  const rows: TodayStop[] = [];

  for (const kind of ['utovar', 'istovar'] as const) {
    for (const shipment of unique) {
      const stops = shipment.vehicleStops ?? [];
      const groups = new Map<string, Cargo[]>();
      for (const cargo of shipment.cargo ?? []) {
        if (!isToday(kind === 'utovar' ? cargo.loadingReadyDate : cargo.unloadingDueDate)) continue;
        const address = kind === 'utovar' ? cargo.loadingAddress : cargo.unloadingAddress;
        const key = [address?.countryCode, address?.postalCode, address?.placeName].join('|');
        groups.set(key, [...(groups.get(key) ?? []), cargo]);
      }

      for (const [key, cargos] of groups) {
        const address = kind === 'utovar' ? cargos[0].loadingAddress : cargos[0].unloadingAddress;
        const stopOf = (cargo: Cargo) => stops.find((stop) => stopCargoIds(stop, kind).includes(cargo.id));
        // Only the stop that carries this cargo: unassigned cargo shows „+ Dodijeli vozilo”.
        const stop = stopOf(cargos[0]);
        rows.push({
          id: `${shipment.id}:${kind}:${key}`,
          kind,
          shipmentId: shipment.id,
          orderNumber: shipment.orderNumber,
          clientId: shipment.clientId,
          isAgency: shipment.isAgency,
          contractorId: shipment.transportContractorId,
          countryCode: address?.countryCode,
          place: [address?.postalCode, address?.placeName].filter(Boolean).join(' ') || '—',
          cargo: summarizeCargo(cargos),
          vehicleId: stop?.vehicleId,
          driverId: stop?.driverId ?? undefined,
          done: cargos.every((cargo) => isCargoDone(cargo, kind, stopOf(cargo))),
        });
      }
    }
  }

  // Finished stops stay (they prove it happened) but go after what's left.
  return [...rows.filter((row) => !row.done), ...rows.filter((row) => row.done)];
}
