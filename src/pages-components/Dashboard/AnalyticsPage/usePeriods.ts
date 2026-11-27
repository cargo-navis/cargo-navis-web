import * as React from 'react';

import type { GetShipmentAnalyticsParams, ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';
import { useShipmentAnalytics, useShipmentPriceAnalytics } from '@/lib/hooks/api';
import { useDelayedFlag } from '@/lib/hooks/useDelayedFlag';

import type { Period } from './ChartCard';
import { type Filters, isLastPeriodPartial, previousRange, selectionRange } from './filters';
import { periodLabel } from './format';

/** Counts and prices per period (two API calls), merged by period. */
export function mergePeriods(
  count: ShipmentAnalytics,
  price: ShipmentPriceAnalytics,
  { partial, now }: { partial: boolean; now: Date }
): Period[] {
  const priceByPeriod = new Map(price.periods.map((item) => [item.period, item]));
  return count.periods.map((item, index) => {
    const prices = priceByPeriod.get(item.period);
    return {
      key: item.period,
      ...periodLabel(item.period, count.granularity, now),
      partial: partial && index === count.periods.length - 1,
      countRegular: item.countRegular,
      countAgency: item.countAgency,
      revenueRegular: prices?.revenueRegular ?? 0,
      revenueAgency: prices?.revenueAgency ?? 0,
      costAgency: prices?.costAgency ?? 0,
    };
  });
}

/**
 * The selected range and the one right before it (for the tiles' change), with the entity filter. Keeps the previous
 * numbers while a filter change refetches: `dim` turns on after 300ms (DECISIONS §2 Loading).
 */
export function usePeriods(filters: Filters, today: Date) {
  const range = selectionRange(filters.selection, today);
  const params: GetShipmentAnalyticsParams = {
    ...range,
    granularity: filters.granularity,
    clientId: filters.client,
    driverId: filters.driver,
    vehicleId: filters.vehicle,
  };
  const previous = previousRange(filters.selection, today);
  const previousParams = { ...params, from: previous?.from, to: previous?.to };

  const count = useShipmentAnalytics(params);
  const price = useShipmentPriceAnalytics(params);
  const countBefore = useShipmentAnalytics(previousParams, { enabled: !!previous });
  const priceBefore = useShipmentPriceAnalytics(previousParams, { enabled: !!previous });

  const partial = isLastPeriodPartial(range, today);
  const periods = React.useMemo(
    () => (count.data && price.data ? mergePeriods(count.data, price.data, { partial, now: today }) : undefined),
    [count.data, price.data, partial, today]
  );

  const refetching = (count.isFetching && count.isPlaceholderData) || (price.isFetching && price.isPlaceholderData);
  const dim = useDelayedFlag(refetching);

  return {
    range,
    periods,
    count: count.data,
    price: price.data,
    // The previous range's numbers only once they belong to the current filters (no stale „+300 %” while loading).
    before: previous
      ? {
          count: countBefore.isPlaceholderData ? undefined : countBefore.data,
          price: priceBefore.isPlaceholderData ? undefined : priceBefore.data,
          label: previous.label,
        }
      : undefined,
    isError: (count.isError && !count.data) || (price.isError && !price.data),
    dim,
    refetch: () => {
      void count.refetch();
      void price.refetch();
    },
  };
}

export type PeriodsData = ReturnType<typeof usePeriods>;
