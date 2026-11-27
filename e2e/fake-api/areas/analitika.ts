import type {
  ClientAnalyticsItem,
  DriverAnalyticsItem,
  ShipmentAnalytics,
  ShipmentPriceAnalytics,
  TransportContractorAnalyticsItem,
  VehicleAnalyticsItem,
} from '@/lib/api/analytics.d';

import type { Db } from '../db';
import { ok, route } from '../http';
import type { StoredShipment } from './nalozi';

/**
 * Analitika, computed from this test's nalozi (by createdAt), so the numbers move with the data. Periods are days
 * (`YYYY-MM-DD`), months (`YYYY-MM`) or years (`YYYY`); week periods start on Monday. Without `from` / `to` („Svi datumi”)
 * the range is the first to the last nalog. A nalog belongs to a driver or vehicle when one of its stops does.
 */
type Granularity = ShipmentAnalytics['granularity'];

function periodOf(date: string, granularity: Granularity): string {
  const dayText = date.slice(0, 10);
  if (granularity === 'year') return dayText.slice(0, 4);
  if (granularity === 'month') return dayText.slice(0, 7);
  if (granularity === 'week') {
    const value = new Date(`${dayText}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
    return value.toISOString().slice(0, 10);
  }
  return dayText;
}

function periodsBetween(from: string, to: string, granularity: Granularity): string[] {
  const periods: string[] = [];
  const cursor = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  while (cursor <= end) {
    const period = periodOf(cursor.toISOString(), granularity);
    if (!periods.includes(period)) periods.push(period);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return periods;
}

/** The query's range, or the data's when it is open („Svi datumi”). */
function rangeOf(db: Db, query: URLSearchParams) {
  const days = db.nalozi.map((item) => item.createdAt.slice(0, 10)).sort();
  return {
    from: query.get('from') ?? days[0] ?? '2026-01-01',
    to: query.get('to') ?? days.at(-1) ?? '2026-01-01',
  };
}

/** Stops of a nalog (by its cargo), for the driver / vehicle filters and tables. */
function stopsOf(db: Db, shipment: StoredShipment) {
  const cargoIds = new Set(shipment.cargo.map((item) => item.id));
  return db.prijevozi.stops.filter((stop) =>
    [...stop.loadingCargoIds, ...stop.unloadingCargoIds].some((id) => cargoIds.has(id))
  );
}

function selected(db: Db, query: URLSearchParams): StoredShipment[] {
  const { from, to } = rangeOf(db, query);
  const clientId = query.get('clientId');
  const driverId = query.get('driverId');
  const vehicleId = query.get('vehicleId');
  return db.nalozi.filter((item) => {
    const created = item.createdAt.slice(0, 10);
    if (created < from || created > to) return false;
    if (clientId && item.clientId !== clientId) return false;
    if (driverId && !stopsOf(db, item).some((stop) => stop.driverId === driverId)) return false;
    if (vehicleId && !stopsOf(db, item).some((stop) => stop.vehicleId === vehicleId)) return false;
    return true;
  });
}

const average = (total: number, count: number) => (count ? total / count : 0);
const sum = (list: StoredShipment[], pick: (item: StoredShipment) => number) =>
  list.reduce((total, item) => total + pick(item), 0);

/** Groups the selected nalozi by a key (several keys per nalog allowed) for the per-entity tables. */
function groupBy(list: StoredShipment[], keys: (item: StoredShipment) => (string | null | undefined)[]) {
  const groups = new Map<string, StoredShipment[]>();
  for (const item of list) {
    for (const key of new Set(keys(item))) {
      if (!key) continue;
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
  }
  return [...groups.entries()];
}

export const analitikaRoutes = [
  route('GET', '/api/analytics/shipments/count', ({ query }, db) => {
    const granularity = (query.get('granularity') ?? 'day') as Granularity;
    const shipments = selected(db, query);
    const { from, to } = rangeOf(db, query);
    const periods = periodsBetween(from, to, granularity).map((period) => {
      const inPeriod = shipments.filter((item) => periodOf(item.createdAt, granularity) === period);
      return {
        period,
        countRegular: inPeriod.filter((item) => !item.isAgency).length,
        countAgency: inPeriod.filter((item) => item.isAgency).length,
      };
    });
    const totalRegular = shipments.filter((item) => !item.isAgency).length;
    const totalAgency = shipments.length - totalRegular;
    const body: ShipmentAnalytics = {
      totalRegular,
      totalAgency,
      averageRegular: average(totalRegular, periods.length),
      averageAgency: average(totalAgency, periods.length),
      granularity,
      periods,
    };
    return ok(body);
  }),
  route('GET', '/api/analytics/shipments/price', ({ query }, db) => {
    const granularity = (query.get('granularity') ?? 'day') as Granularity;
    const shipments = selected(db, query);
    const { from, to } = rangeOf(db, query);
    const periods = periodsBetween(from, to, granularity).map((period) => {
      const inPeriod = shipments.filter((item) => periodOf(item.createdAt, granularity) === period);
      return {
        period,
        revenueRegular: sum(
          inPeriod.filter((item) => !item.isAgency),
          (item) => item.price
        ),
        revenueAgency: sum(
          inPeriod.filter((item) => item.isAgency),
          (item) => item.price
        ),
        costAgency: sum(
          inPeriod.filter((item) => item.isAgency),
          (item) => item.contractorPrice ?? 0
        ),
      };
    });
    const regular = shipments.filter((item) => !item.isAgency);
    const agency = shipments.filter((item) => item.isAgency);
    const body: ShipmentPriceAnalytics = {
      totalRevenueRegular: sum(regular, (item) => item.price),
      totalRevenueAgency: sum(agency, (item) => item.price),
      totalCostAgency: sum(agency, (item) => item.contractorPrice ?? 0),
      averageRevenueRegular: average(
        sum(regular, (item) => item.price),
        regular.length
      ),
      averageRevenueAgency: average(
        sum(agency, (item) => item.price),
        agency.length
      ),
      averageCostAgency: average(
        sum(agency, (item) => item.contractorPrice ?? 0),
        agency.length
      ),
      granularity,
      periods,
    };
    return ok(body);
  }),
  route('GET', '/api/analytics/clients', ({ query }, db) => {
    const items: ClientAnalyticsItem[] = groupBy(selected(db, query), (item) => [item.clientId]).map(
      ([clientId, list]) => ({ clientId, shipmentCount: list.length, totalPrice: sum(list, (item) => item.price) })
    );
    return ok(items);
  }),
  route('GET', '/api/analytics/drivers', ({ query }, db) => {
    const own = selected(db, query).filter((item) => !item.isAgency);
    const items: DriverAnalyticsItem[] = groupBy(own, (item) => stopsOf(db, item).map((stop) => stop.driverId)).map(
      ([driverId, list]) => ({ driverId, shipmentCount: list.length, totalPrice: sum(list, (item) => item.price) })
    );
    return ok(items);
  }),
  route('GET', '/api/analytics/vehicles', ({ query }, db) => {
    const own = selected(db, query).filter((item) => !item.isAgency);
    const items: VehicleAnalyticsItem[] = groupBy(own, (item) => stopsOf(db, item).map((stop) => stop.vehicleId)).map(
      ([vehicleId, list]) => ({ vehicleId, shipmentCount: list.length, totalPrice: sum(list, (item) => item.price) })
    );
    return ok(items);
  }),
  route('GET', '/api/analytics/transport-contractors', ({ query }, db) => {
    const agency = selected(db, query).filter((item) => item.isAgency);
    const items: TransportContractorAnalyticsItem[] = groupBy(agency, (item) => [item.transportContractorId]).map(
      ([contractorId, list]) => {
        const totalRevenue = sum(list, (item) => item.price);
        const totalCost = sum(list, (item) => item.contractorPrice ?? 0);
        return { contractorId, shipmentCount: list.length, totalCost, totalRevenue, margin: totalRevenue - totalCost };
      }
    );
    return ok(items);
  }),
];
