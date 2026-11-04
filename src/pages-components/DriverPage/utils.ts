import 'dayjs/locale/hr';

import dayjs, { type Dayjs } from 'dayjs';

import type {
  DriverCargoShipment,
  DriverShipmentSummary,
  DriverStop,
  DriverStopCargo,
  DriverStopDisponent,
} from '@/lib/api/driver.d';
import type { VehicleStopAddress, VehicleStopDocument } from '@/lib/api/vehicleStops.d';
import type { IconType } from '@/ui';

/** Every stop of the order is confirmed. */
export function isShipmentCompleted(shipment: DriverShipmentSummary): boolean {
  return shipment.totalStopsCount > 0 && shipment.completedStopsCount === shipment.totalStopsCount;
}

/** The stop to drive to next: in the latest-first list, the lowest one not completed yet. */
export function getNextStopId(stops: DriverStop[]): string | null {
  return stops.findLast((stop) => !stop.completedAt)?.id ?? null;
}

/**
 * Day label shown above the first stop of each day: `Danas · uto 4.11.`, `Jučer · …`, `Sutra · …`, otherwise the
 * weekday and date. A past stop not completed yet is late instead.
 */
export function getStopDayLabel(
  stop: Pick<DriverStop, 'date' | 'completedAt'>,
  now: Dayjs
): {
  label: string;
  isLate: boolean;
} {
  if (!stop.date) return { label: 'Bez datuma', isLate: false };

  const day = dayjs(stop.date).locale('hr');
  const dayAndDate = day.isSame(now, 'year') ? day.format('ddd D.M.') : day.format('ddd D.M.YYYY.');

  if (day.isBefore(now, 'day') && !stop.completedAt) return { label: `Kasni · ${dayAndDate}`, isLate: true };
  if (day.isSame(now, 'day')) return { label: `Danas · ${dayAndDate}`, isLate: false };
  if (day.isSame(now.subtract(1, 'day'), 'day')) return { label: `Jučer · ${dayAndDate}`, isLate: false };
  if (day.isSame(now.add(1, 'day'), 'day')) return { label: `Sutra · ${dayAndDate}`, isLate: false };

  return { label: dayAndDate, isLate: false };
}

export function getStopKindLabels(stop: DriverStop): { title: string; action: string; confirmed: string } {
  const hasLoading = stop.loadingCargos.length > 0;
  const hasUnloading = stop.unloadingCargos.length > 0;

  if (hasLoading && hasUnloading) {
    return { title: 'UTOVAR I ISTOVAR', action: 'Potvrdi utovar i istovar', confirmed: 'Postaja potvrđena' };
  }

  if (hasUnloading) {
    return { title: 'ISTOVAR', action: 'Potvrdi istovar', confirmed: 'Istovar potvrđen' };
  }

  return { title: 'UTOVAR', action: 'Potvrdi utovar', confirmed: 'Utovar potvrđen' };
}

/** The clients of the stop's orders, each once (a stop can serve several orders). */
export function getStopClientNames(stop: DriverStop): string[] {
  const cargos = [...stop.loadingCargos, ...stop.unloadingCargos];
  return Array.from(new Set(cargos.map((cargo) => cargo.shipment.clientName).filter((name): name is string => !!name)));
}

/** Main title of a stop: its clients, else its order numbers (`Nalog #2026/1234`). */
export function getStopTitle(stop: DriverStop): string | null {
  const clientNames = getStopClientNames(stop);
  if (clientNames.length > 0) return clientNames.join(', ');

  const orderNumbers = getStopOrderNumbers(stop);
  return orderNumbers.length > 0 ? `Nalog ${orderNumbers.join(', ')}` : null;
}

/** The stop's order numbers, each once, as `#2026/1234`. */
export function getStopOrderNumbers(stop: DriverStop): string[] {
  const cargos = [...stop.loadingCargos, ...stop.unloadingCargos];
  return Array.from(new Set(cargos.map((cargo) => `#${cargo.shipment.orderNumber}`)));
}

/** Subtext for stop toasts: the clients and orders, e.g. `Podravka d.d. • #2026/1234 • #2026/1240`. */
export function getStopToastDescription(stop: DriverStop): string {
  return [getStopClientNames(stop).join(', '), ...getStopOrderNumbers(stop)].filter(Boolean).join(' • ');
}

/**
 * Cargo this stop unloads that isn't loaded yet. The backend refuses to confirm the stop until it is (error
 * CARGO_NOT_YET_LOADED). Cargo loaded at this same stop doesn't count: confirming loads it first.
 */
export function getNotYetLoadedCargos(stop: DriverStop): DriverStopCargo[] {
  const loadedHere = new Set(stop.loadingCargos.map((cargo) => cargo.id));
  return stop.unloadingCargos.filter((cargo) => cargo.loadStatus === 'not_yet_loaded' && !loadedHere.has(cargo.id));
}

/** Unconfirmed stops in the route that load any of these cargos. Empty when they are on another route. */
export function getPendingLoadingStops(cargos: DriverStopCargo[], stops: DriverStop[]): DriverStop[] {
  const cargoIds = new Set(cargos.map((cargo) => cargo.id));
  return stops.filter((stop) => !stop.completedAt && stop.loadingCargos.some((cargo) => cargoIds.has(cargo.id)));
}

/** Compact name for the header, e.g. "I. Horvat". Falls back to whichever part exists. */
export function getShortName({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (first && last) return `${first[0]}. ${last}`;
  return first || last || undefined;
}

export function getDisponentName(disponent: DriverStopDisponent): string | null {
  return [disponent.firstName, disponent.lastName].filter(Boolean).join(' ') || null;
}

/** The order's dispatcher: an order has one, so the first stop that names it is enough. */
export function getStopsDisponent(stops: DriverStop[]): DriverStopDisponent | null {
  return (
    stops.find(({ disponent }) => disponent && (getDisponentName(disponent) || disponent.phoneNumber))?.disponent ??
    null
  );
}

/** Short name of a stop for inline text, as its card reads: the title and the place, e.g. "Podravka d.d. (Koprivnica)". */
export function getStopShortName(stop: DriverStop): string | null {
  const title = getStopTitle(stop);
  const place = stop.address?.placeName;
  if (title && place) return `${title} (${place})`;
  return title ?? place ?? null;
}

export function getNavigationUrl(address: VehicleStopAddress | null): string | null {
  if (!address) return null;

  const place = [address.postalCode, address.placeName].filter(Boolean).join(' ');
  const query = [address.streetName, place].filter(Boolean).join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function groupCargosByShipment(
  cargos: DriverStopCargo[]
): { shipment: DriverCargoShipment; cargos: DriverStopCargo[] }[] {
  const groups = new Map<string, { shipment: DriverCargoShipment; cargos: DriverStopCargo[] }>();

  for (const cargo of cargos) {
    const group = groups.get(cargo.shipment.id);
    if (group) {
      group.cargos.push(cargo);
    } else {
      groups.set(cargo.shipment.id, { shipment: cargo.shipment, cargos: [cargo] });
    }
  }

  return Array.from(groups.values());
}

export function formatStopDate(date: string | null, now: Dayjs): string {
  if (!date) return 'Bez datuma';

  const day = dayjs(date).locale('hr');
  if (day.isSame(now, 'day')) return 'Danas';
  if (day.isSame(now.add(1, 'day'), 'day')) return 'Sutra';

  return day.format('ddd D.M.');
}

/** When a stop was confirmed: `Danas · 09:05`, `Jučer · 17:45`, `pon. 12.10. · 09:00`, other years with the full year. */
export function formatCompletedAt(completedAt: string, now: Dayjs): string {
  const at = dayjs(completedAt).locale('hr');
  const time = at.format('HH:mm');

  if (at.isSame(now, 'day')) return `Danas · ${time}`;
  if (at.isSame(now.subtract(1, 'day'), 'day')) return `Jučer · ${time}`;

  const date = at.isSame(now, 'year') ? at.format('ddd D.M.') : at.format('ddd D.M.YYYY.');
  return `${date} · ${time}`;
}

const formatNumber = (value: number) => value.toLocaleString('hr-HR');

export function formatCargoMeasures(cargo: Pick<DriverStopCargo, 'weight' | 'ldm'>): string[] {
  const measures: string[] = [];
  if (cargo.weight != null) measures.push(`${formatNumber(cargo.weight)} kg`);
  if (cargo.ldm != null) measures.push(`${formatNumber(cargo.ldm)} ldm`);
  return measures;
}

const ICON_BY_MIME_TYPE: Record<string, IconType> = {
  'application/pdf': 'IconFileTypePdf',
  'image/jpeg': 'IconFileTypeJpg',
  'image/png': 'IconFileTypePng',
};

const ICON_BY_EXTENSION: Record<string, IconType> = {
  pdf: 'IconFileTypePdf',
  jpg: 'IconFileTypeJpg',
  jpeg: 'IconFileTypeJpg',
  png: 'IconFileTypePng',
  doc: 'IconFileTypeDoc',
  docx: 'IconFileTypeDocx',
  xls: 'IconFileTypeXls',
  xlsx: 'IconFileTypeXls',
  csv: 'IconFileTypeCsv',
  zip: 'IconFileTypeZip',
  txt: 'IconFileTypeTxt',
  xml: 'IconFileTypeXml',
};

/** Icon for a document in the stop sheet: by mime type, then by file extension (uploads are often octet-stream). */
export function getDocumentIcon(document: Pick<VehicleStopDocument, 'name' | 'mimeType'>): IconType {
  const mimeType = document.mimeType.toLowerCase();
  const extension = document.name.split('.').pop()?.toLowerCase() ?? '';

  return (
    ICON_BY_MIME_TYPE[mimeType] ??
    ICON_BY_EXTENSION[extension] ??
    (mimeType.startsWith('image/') ? 'IconPhoto' : 'IconFile')
  );
}
