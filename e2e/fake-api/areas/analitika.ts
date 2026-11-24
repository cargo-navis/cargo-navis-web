import type { ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api/analytics.d';

import type { Db } from '../db';
import { ok, route } from '../http';
import type { StoredShipment } from './nalozi';

/**
 * Analitika, computed from this test's nalozi (by createdAt), so the numbers move with the data. Periods are days
 * (`YYYY-MM-DD`), months (`YYYY-MM`) or years (`YYYY`); week periods start on Monday. Phase 1 only needs the day counts
 * of Početna's „Nalozi · zadnjih 7 dana” tile.
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

function selected(db: Db, query: URLSearchParams): StoredShipment[] {
  const from = query.get('from') ?? '0000-00-00';
  const to = query.get('to') ?? '9999-99-99';
  const clientId = query.get('clientId');
  return db.nalozi.filter((item) => {
    const created = item.createdAt.slice(0, 10);
    return created >= from && created <= to && (!clientId || item.clientId === clientId);
  });
}

const average = (total: number, count: number) => (count ? total / count : 0);

export const analitikaRoutes = [
  route('GET', '/api/analytics/shipments/count', ({ query }, db) => {
    const granularity = (query.get('granularity') ?? 'day') as Granularity;
    const shipments = selected(db, query);
    const periods = periodsBetween(query.get('from')!, query.get('to')!, granularity).map((period) => {
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
    const sum = (list: StoredShipment[], pick: (item: StoredShipment) => number) =>
      list.reduce((total, item) => total + pick(item), 0);
    const periods = periodsBetween(query.get('from')!, query.get('to')!, granularity).map((period) => {
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
];
