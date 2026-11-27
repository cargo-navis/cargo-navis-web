/**
 * The Nalozi date filter (lab /date-filter, option C, 2026-11-25): one range + one type in the toolbar's date control.
 * „Utovar ili istovar” (default) = a nalog with any teret's „spremno za utovar” or „rok istovara” in the range (backend
 * `activityDate*`, an OR); „Utovar” / „Istovar” = only that date (`loadingReadyDate*` / `unloadingDueDate*`). One pair
 * at a time: setting one clears the others. Stored and sent under the API names, so the Početna links
 * (?loadingReadyDateFrom=…) open with the right type.
 */

import type { ShipmentFilters } from '../providers/ShipmentsFiltersProvider';

export type DateFilterType = 'any' | 'loading' | 'unloading';

type DateKey = keyof ShipmentFilters;

/** The [from, to] filter keys (= API params) of each type; earlier wins if an old saved set has several. */
export const DATE_FILTER_KEYS: Record<DateFilterType, readonly [DateKey, DateKey]> = {
  any: ['activityDateFrom', 'activityDateTo'],
  loading: ['loadingReadyDateFrom', 'loadingReadyDateTo'],
  unloading: ['unloadingDueDateFrom', 'unloadingDueDateTo'],
};

const TYPES = Object.keys(DATE_FILTER_KEYS) as DateFilterType[];

export const DATE_FILTER_TYPE_LABEL: Record<DateFilterType, string> = {
  any: 'Utovar ili istovar',
  loading: 'Utovar',
  unloading: 'Istovar',
};

/** While a range is on and no sort was picked: by date, earliest first (any: the date that matched). */
export const DATE_FILTER_SORT: Record<DateFilterType, string> = {
  any: 'activityDate,asc',
  loading: 'loadingReadyDate,asc',
  unloading: 'unloadingDueDate,asc',
};

export interface DateFilter {
  type: DateFilterType;
  /** YYYY-MM-DD; one may be missing (old links: „from 14.11.”). */
  from?: string;
  to?: string;
}

/** The active date filter, if any. */
export function readDateFilter(filters: Partial<ShipmentFilters>): DateFilter | undefined {
  for (const type of TYPES) {
    const [fromKey, toKey] = DATE_FILTER_KEYS[type];
    if (filters[fromKey] || filters[toKey]) return { type, from: filters[fromKey], to: filters[toKey] };
  }
  return undefined;
}

/** The filter patch for a type + range; every other date pair is cleared (no range = no date filter at all). */
export function dateFilterPatch(type: DateFilterType, from?: string, to?: string): Partial<ShipmentFilters> {
  return Object.fromEntries(
    TYPES.flatMap((each) => {
      const [fromKey, toKey] = DATE_FILTER_KEYS[each];
      return [
        [fromKey, each === type ? from : undefined],
        [toKey, each === type ? to : undefined],
      ];
    })
  );
}

/** Keeps only the active pair (an old saved set may hold a utovar and an istovar range: the utovar one stays). */
export function withOneDateFilter<T extends Partial<ShipmentFilters>>(filters: T): T {
  const active = readDateFilter(filters);
  return active ? { ...filters, ...dateFilterPatch(active.type, active.from, active.to) } : filters;
}

/** Is a date (ISO, a time part is ignored) inside the filter's range? */
export function isInDateFilter(date: string | null | undefined, filter: DateFilter) {
  const day = date?.slice(0, 10);
  return !!day && (!filter.from || day >= filter.from) && (!filter.to || day <= filter.to);
}
