import 'dayjs/locale/hr';

import dayjs, { type Dayjs } from 'dayjs';

import type { DriverCargoShipment, DriverShipment, DriverStop, DriverStopCargo } from '@/lib/api/driver.d';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops.d';

const isCompleted = (stop: DriverStop) => Boolean(stop.completedAt);

export interface RouteDay {
  key: string;
  label: string;
  isLate: boolean;
  stops: DriverStop[];
}

export interface RouteTimeline {
  /** Completed stops, in route order. */
  completed: DriverStop[];
  /** First active stop in route order. */
  nextStopId: string | null;
  /** Active stops in route order, split wherever the day changes. */
  days: RouteDay[];
}

export function getDayDividerLabel(date: string | null, now: Dayjs): { label: string; isLate: boolean } {
  if (!date) return { label: 'Bez datuma', isLate: false };

  const day = dayjs(date).locale('hr');
  const dayAndDate = day.format('ddd D.M.');

  if (day.isBefore(now, 'day')) return { label: `Kasni · ${dayAndDate}`, isLate: true };
  if (day.isSame(now, 'day')) return { label: `Danas · ${dayAndDate}`, isLate: false };
  if (day.isSame(now.add(1, 'day'), 'day')) return { label: `Sutra · ${dayAndDate}`, isLate: false };

  return { label: dayAndDate, isLate: false };
}

// Never re-sorts: the dispatcher's route order is the truth, dates only add dividers.
export function buildRouteTimeline(stops: DriverStop[], now: Dayjs): RouteTimeline {
  const completed = stops.filter(isCompleted);
  const active = stops.filter((stop) => !isCompleted(stop));
  const days: RouteDay[] = [];

  active.forEach((stop, index) => {
    const lastDay = days[days.length - 1];
    if (lastDay && lastDay.stops[lastDay.stops.length - 1].date === stop.date) {
      lastDay.stops.push(stop);
      return;
    }
    days.push({ key: `${index}-${stop.date ?? 'none'}`, ...getDayDividerLabel(stop.date, now), stops: [stop] });
  });

  return { completed, nextStopId: active[0]?.id ?? null, days };
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

export function getStopCompanyName(stop: DriverStop): string | null {
  return (
    stop.loadingCargos.find((cargo) => cargo.loadingCompanyName)?.loadingCompanyName ??
    stop.unloadingCargos.find((cargo) => cargo.unloadingCompanyName)?.unloadingCompanyName ??
    null
  );
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

// The API returns stops only, so shipments are rebuilt here. Stops completed before the
// `completedWithinDays` window are not returned, so older shipments can miss early stops (known gap).
export function buildDriverShipments(stops: DriverStop[]): DriverShipment[] {
  const shipments = new Map<string, DriverShipment>();
  const firstActiveStopIndex = new Map<string, number>();

  stops.forEach((stop, index) => {
    const shipmentIds = new Set([...stop.loadingCargos, ...stop.unloadingCargos].map((cargo) => cargo.shipment.id));

    shipmentIds.forEach((shipmentId) => {
      const loadingCargos = stop.loadingCargos.filter((cargo) => cargo.shipment.id === shipmentId);
      const unloadingCargos = stop.unloadingCargos.filter((cargo) => cargo.shipment.id === shipmentId);
      const shipmentStop: DriverStop = { ...stop, loadingCargos, unloadingCargos };

      let shipment = shipments.get(shipmentId);
      if (!shipment) {
        const { orderNumber } = (loadingCargos[0] ?? unloadingCargos[0]).shipment;
        shipment = {
          id: shipmentId,
          orderNumber,
          origin: null,
          destination: null,
          completedStopsCount: 0,
          totalStopsCount: 0,
          stops: [],
        };
        shipments.set(shipmentId, shipment);
      }

      shipment.stops.push(shipmentStop);
      shipment.totalStopsCount += 1;
      if (isCompleted(stop)) shipment.completedStopsCount += 1;
      if (loadingCargos.length > 0 && !shipment.origin) shipment.origin = stop.address;
      if (unloadingCargos.length > 0) shipment.destination = stop.address;
      if (!isCompleted(stop) && !firstActiveStopIndex.has(shipmentId)) firstActiveStopIndex.set(shipmentId, index);
    });
  });

  return Array.from(shipments.values())
    .filter((shipment) => firstActiveStopIndex.has(shipment.id))
    .sort((a, b) => firstActiveStopIndex.get(a.id)! - firstActiveStopIndex.get(b.id)!);
}

const formatNumber = (value: number) => value.toLocaleString('hr-HR');

export function formatCargoMeasures(cargo: Pick<DriverStopCargo, 'weight' | 'ldm'>): string[] {
  const measures: string[] = [];
  if (cargo.weight != null) measures.push(`${formatNumber(cargo.weight)} kg`);
  if (cargo.ldm != null) measures.push(`${formatNumber(cargo.ldm)} ldm`);
  return measures;
}
