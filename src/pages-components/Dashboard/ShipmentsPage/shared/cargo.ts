import type { Cargo } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { daysFromToday } from '@/lib/utils/date';
import { PalleteType } from '@/lib/utils/palletes';

import { formatNumber } from './format';

/** Cargo with custom dimensions (Cargo.metadata type "nonstandard"); otherwise pallets. */
export const isCustomCargo = (cargo: Cargo) => cargo.metadata?.type === 'nonstandard';

/** Over the usual road limits (EU: 2,55 m wide, ~3 m of cargo height on a trailer, 13,6 m long). */
export function isOversize(cargo: Cargo) {
  if (!isCustomCargo(cargo)) return false;
  const { width = 0, height = 0, length = 0 } = cargo.metadata ?? {};
  return width > 2.55 || height > 3 || length > 13.6;
}

const PALLET_LABEL: Record<PalleteType, string> = {
  [PalleteType.Small]: 'mala paleta 80×60',
  [PalleteType.Euro]: 'EUR paleta 120×80',
  [PalleteType.Ship]: 'brodska paleta 120×100',
  [PalleteType.Industry]: 'industrijska paleta 100×100',
  [PalleteType.Jumbo]: 'jumbo paleta 120×120',
};

/** „EUR paleta 120×80” */
export const palletLabel = (cargo: Cargo) => PALLET_LABEL[cargo.metadata?.palleteType as PalleteType] ?? 'paleta';

/** „4 × 2,5 × 3,2 m”, or null without dimensions. */
export function cargoDimensions(cargo: Cargo) {
  const { length, width, height } = cargo.metadata ?? {};
  if (!length && !width && !height) return null;
  return `${[length, width, height].map((value) => (value ? formatNumber(value, 2) : '—')).join(' × ')} m`;
}

/** What one cargo is: „14 × EUR paleta 120×80”, „4 × 2,5 × 3,2 m” or „Izvanredni teret”. */
export function cargoQuantity(cargo: Cargo) {
  if (!isCustomCargo(cargo)) return `${cargo.metadata?.palleteAmount ?? 0} × ${palletLabel(cargo)}`;
  return cargoDimensions(cargo) ?? 'Izvanredni teret';
}

export function cargoTotals(cargos: Cargo[]) {
  return {
    ldm: cargos.reduce((sum, cargo) => sum + (cargo.ldm || 0), 0),
    weightKg: cargos.reduce((sum, cargo) => sum + (cargo.weight || 0), 0),
    pallets: cargos.reduce((sum, cargo) => sum + (isCustomCargo(cargo) ? 0 : cargo.metadata?.palleteAmount || 0), 0),
  };
}

/** Second line of the Teret cell: „14 pal”, one piece's dimensions, „3 kom”, or „10 pal + 1 kom”. */
export function cargoContentsLabel(cargos: Cargo[]) {
  const { pallets } = cargoTotals(cargos);
  const custom = cargos.filter(isCustomCargo);
  if (!custom.length) return `${pallets} pal`;
  if (!pallets && custom.length === 1) return cargoDimensions(custom[0]) ?? 'izvanredni';
  if (!pallets) return `${custom.length} kom`;
  return `${pallets} pal + ${custom.length} kom`;
}

/** Load status of a cargo, with „Kasni” when its next date has passed. */
export type CargoState = 'waiting' | 'loaded' | 'unloaded' | 'late';

export const CARGO_STATUS_LABEL: Record<LoadStatus, string> = {
  [LoadStatus.NotYetLoaded]: 'Čeka utovar',
  [LoadStatus.Loaded]: 'Utovareno',
  [LoadStatus.Unloaded]: 'Istovareno',
};

export const LOAD_STATUSES = [LoadStatus.NotYetLoaded, LoadStatus.Loaded, LoadStatus.Unloaded] as const;

/**
 * Agency teret status (lab /order parts.tsx AGENCY_STATUS, decided 2026-11-19): nobody reports progress on an agency
 * nalog (no vehicle, no driver app, the podvozar reports nothing), so the only status is the one the dispatcher sets
 * by hand. Worded as a state of the teret, never as tracking.
 */
export const AGENCY_STATUS_LABEL: Record<LoadStatus, string> = {
  [LoadStatus.NotYetLoaded]: 'Nije utovaren',
  [LoadStatus.Loaded]: 'Utovaren',
  [LoadStatus.Unloaded]: 'Istovaren',
};

/** „Nije utovaren” / „Označeno: Utovaren” / „Označeno: Istovaren” — the agency teret badge. */
export const agencyStatusBadgeLabel = (status: LoadStatus) =>
  status === LoadStatus.NotYetLoaded ? AGENCY_STATUS_LABEL[status] : `Označeno: ${AGENCY_STATUS_LABEL[status]}`;

export const isPast = (date: string | null | undefined) => !!date && daysFromToday(date) < 0;

export function cargoState(cargo: Cargo): CargoState {
  const status = cargo.loadStatus ?? LoadStatus.NotYetLoaded;
  if (status === LoadStatus.Unloaded) return 'unloaded';
  if (status === LoadStatus.Loaded) return isPast(cargo.unloadingDueDate) ? 'late' : 'loaded';
  return isPast(cargo.loadingReadyDate) ? 'late' : 'waiting';
}
