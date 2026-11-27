import dayjs from 'dayjs';
import * as React from 'react';

import { InvoiceStatus, type PaginatedResponse, type Shipment } from '@/lib/api';
import {
  useAlerts,
  useClients,
  useContractors,
  useEmployees,
  useShipmentAnalytics,
  useShipments,
  useShipmentsData,
  useVehicles,
} from '@/lib/hooks/api';

import { buildTodayStops } from './todayStops';
import { buildWarning, sortWarnings } from './warnings';

const ISO = 'YYYY-MM-DD';
const totalElements = (data: PaginatedResponse<Shipment>) => data.totalElements;

/** `{ onRetry }` when a query failed and has nothing to show (the tiles then offer a retry). */
const retryOnError = (query: { isError: boolean; data: unknown; refetch(): unknown }) =>
  query.isError && query.data === undefined ? { onRetry: () => void query.refetch() } : undefined;

/** Names for ids, from one list query each (instead of a query per row). */
export function useLookups() {
  const { data: clients } = useClients();
  const { data: contractors } = useContractors();
  const { data: employees } = useEmployees({ includeDeleted: true });
  const { data: vehicles } = useVehicles();
  return React.useMemo(
    () => ({
      clientsById: new Map((clients ?? []).map((client) => [client.id, client])),
      contractorsById: new Map((contractors ?? []).map((contractor) => [contractor.id, contractor])),
      employeesById: new Map((employees ?? []).map((employee) => [employee.id, employee])),
      vehiclesById: new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle])),
    }),
    [clients, contractors, employees, vehicles]
  );
}

export type Lookups = ReturnType<typeof useLookups>;

/**
 * Today's utovari and istovari: every nalog with a teret loading or unloading today (`activityDate`, the backend's
 * utovar-OR-istovar filter; one teret may load and another unload, buildTodayStops picks the stops of today).
 */
export function useTodayStops(today: Date) {
  const day = dayjs(today).format(ISO);
  const query = useShipmentsData({ params: { activityDateFrom: day, activityDateTo: day, size: 100 } });
  const stops = React.useMemo(() => (query.data ? buildTodayStops(query.data, today) : undefined), [query.data, today]);
  return {
    stops,
    isError: query.isError && !query.data,
    refetch: () => {
      void query.refetch();
    },
  };
}

/** Counts behind the tiles and the header: `size: 1` queries, only `totalElements` is read. */
export function useCounts() {
  const notInvoiced = useShipments({
    params: { invoiceStatus: InvoiceStatus.NotSent, size: 1 },
    select: totalElements,
  });
  const overdue = useShipments({ params: { isInvoiceOverdue: 'true', size: 1 }, select: totalElements });
  const active = useShipments({ params: { isActive: true, size: 1 }, select: totalElements });
  return {
    notInvoiced: notInvoiced.data,
    notInvoicedError: retryOnError(notInvoiced),
    overdue: overdue.data,
    overdueError: retryOnError(overdue),
    active: active.data,
  };
}

/** Nalozi per day for the last 7 days incl. today (rolling, so it's never an empty Monday) and the 7 before. */
export function useLastSevenDays(today: Date) {
  const day = dayjs(today);
  const current = useShipmentAnalytics({
    from: day.subtract(6, 'day').format(ISO),
    to: day.format(ISO),
    granularity: 'day',
  });
  const previous = useShipmentAnalytics({
    from: day.subtract(13, 'day').format(ISO),
    to: day.subtract(7, 'day').format(ISO),
    granularity: 'day',
  });

  const days = React.useMemo(() => {
    if (!current.data) return undefined;
    const byDate = new Map(current.data.periods.map((period) => [period.period, period]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = dayjs(today).subtract(6 - index, 'day');
      const period = byDate.get(date.format(ISO));
      return {
        date: date.toDate(),
        count: (period?.countRegular ?? 0) + (period?.countAgency ?? 0),
        partial: index === 6,
      };
    });
  }, [current.data, today]);

  const previousTotal = previous.data ? previous.data.totalRegular + previous.data.totalAgency : undefined;
  return { days, previousTotal, error: retryOnError(current) };
}

/** „Treba pažnju”: today's alerts (expiring documents, vehicles, insurance, overdue invoices), most urgent first. */
export function useWarnings(lookups: Lookups, today: Date) {
  const { data: alerts, isError, refetch } = useAlerts();
  const warnings = React.useMemo(
    () =>
      alerts
        ? sortWarnings(
            alerts.map((alert) => ({
              ...buildWarning(alert, { clientsById: lookups.clientsById, now: today }),
              alert,
            }))
          )
        : undefined,
    [alerts, lookups.clientsById, today]
  );
  return { warnings, isError: isError && !alerts, refetch };
}
