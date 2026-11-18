import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import * as React from 'react';

import type { DateRange, DateRangePreset } from '@/components/shared/date-picker';
import type { Granularity } from '@/lib/api';

/**
 * Analitika filters, kept in the URL (lab /analytics): ?tab=regular&razdoblje=3m&po=tjedan&vozac=…
 * - tab: overview (no param) · regular · agency (today's param, so old links keep working);
 * - razdoblje: a preset (default 6m, „sve” = Ukupno) or od + do (YYYY-MM-DD) for a custom range;
 * - po: dan · tjedan · mjesec (default) · godina;
 * - klijent (Ukupno), vozac / vozilo (Vlastiti prijevoz, one or the other). Entity filters reset when the tab changes.
 */

export type View = 'overview' | 'regular' | 'agency';

export const VIEWS: { key: View; label: string }[] = [
  { key: 'overview', label: 'Ukupno' },
  { key: 'regular', label: 'Vlastiti prijevoz' },
  { key: 'agency', label: 'Agencijski nalozi' },
];

export const GRANULARITY: { key: Granularity; param: string; label: string; per: string }[] = [
  { key: 'day', param: 'dan', label: 'Dan', per: 'dnevno' },
  { key: 'week', param: 'tjedan', label: 'Tjedan', per: 'tjedno' },
  { key: 'month', param: 'mjesec', label: 'Mjesec', per: 'mjesečno' },
  { key: 'year', param: 'godina', label: 'Godina', per: 'godišnje' },
];

export type PresetKey = 'ytd' | '3m' | '6m' | '12m' | '2y' | '5y' | 'sve';

interface Preset extends DateRangePreset {
  key: PresetKey;
  /** Length in months (ytd: from 1 January; sve: no limit). */
  months?: number;
  /** „vs …” after a tile's change (agreement: prethodna 3 mjeseca, prethodnih 6 mjeseci, prethodne 2 godine). */
  previous?: string;
}

const monthsBack = (today: Date, months: number) => dayjs(today).subtract(months, 'month').toDate();

const lastMonths = (key: PresetKey, label: string, months: number, previous: string): Preset => ({
  key,
  label,
  months,
  previous,
  range: (today) => ({ from: monthsBack(today, months), to: today }),
});

/** As today (DateRangeFilter), Ukupno included. Passed to the shared DateRangePicker. */
export const PRESETS: Preset[] = [
  {
    key: 'ytd',
    label: 'Od početka godine',
    range: (today) => ({ from: new Date(today.getFullYear(), 0, 1), to: today }),
  },
  lastMonths('3m', 'Zadnja 3 mjeseca', 3, 'prethodna 3 mjeseca'),
  lastMonths('6m', 'Zadnjih 6 mjeseci', 6, 'prethodnih 6 mjeseci'),
  lastMonths('12m', 'Zadnjih 12 mjeseci', 12, 'prethodnih 12 mjeseci'),
  lastMonths('2y', 'Zadnje 2 godine', 24, 'prethodne 2 godine'),
  lastMonths('5y', 'Zadnjih 5 godina', 60, 'prethodnih 5 godina'),
  { key: 'sve', label: 'Ukupno', range: () => undefined },
];

const DEFAULT_PRESET: PresetKey = '6m';
const DEFAULT_GRANULARITY: Granularity = 'month';

const ISO = 'YYYY-MM-DD';
export const toIso = (date: Date) => dayjs(date).format(ISO);

export const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format(ISO) === value;

export type Selection = { preset: PresetKey } | { from: string; to: string };

export interface ApiRange {
  from?: string;
  to?: string;
}

/** The range sent to the API. */
export function selectionRange(selection: Selection, today: Date): ApiRange {
  if ('from' in selection) return { from: selection.from, to: selection.to };
  const range = PRESETS.find((preset) => preset.key === selection.preset)!.range(today);
  return range?.from ? { from: toIso(range.from), to: toIso(range.to ?? today) } : {};
}

/** The same length right before (ytd: the same dates a year back), for the tiles' change. None for „Ukupno”. */
export function previousRange(selection: Selection, today: Date): (Required<ApiRange> & { label: string }) | undefined {
  if ('from' in selection) {
    const from = dayjs(selection.from);
    const days = dayjs(selection.to).diff(from, 'day') + 1;
    return {
      from: from.subtract(days, 'day').format(ISO),
      to: from.subtract(1, 'day').format(ISO),
      label: 'prethodno razdoblje',
    };
  }
  const preset = PRESETS.find((item) => item.key === selection.preset)!;
  if (preset.key === 'sve') return undefined;
  if (preset.key === 'ytd') {
    const year = today.getFullYear() - 1;
    return {
      from: `${year}-01-01`,
      to: dayjs(today).subtract(1, 'year').format(ISO),
      label: `isto razdoblje ${year}.`,
    };
  }
  const from = dayjs(monthsBack(today, preset.months!));
  return {
    from: from.subtract(preset.months!, 'month').format(ISO),
    to: from.subtract(1, 'day').format(ISO),
    label: preset.previous!,
  };
}

/** The picker's value for a selection. */
export function selectionToDateRange(selection: Selection, today: Date): DateRange | undefined {
  if ('from' in selection) return { from: dayjs(selection.from).toDate(), to: dayjs(selection.to).toDate() };
  return PRESETS.find((preset) => preset.key === selection.preset)!.range(today);
}

/** A picked range back to a preset when it is one, otherwise a custom range. */
export function dateRangeToSelection(range: DateRange | undefined, today: Date): Selection {
  if (!range?.from) return { preset: 'sve' };
  const from = toIso(range.from);
  const to = toIso(range.to ?? range.from);
  const preset = PRESETS.find((item) => {
    const presetRange = item.range(today);
    return presetRange?.from && toIso(presetRange.from) === from && toIso(presetRange.to ?? today) === to;
  });
  return preset ? { preset: preset.key } : { from, to };
}

/** The current period isn't finished when the range reaches today: its bar is lighter + „u tijeku”. */
export function isLastPeriodPartial(range: ApiRange, today: Date) {
  return !range.to || range.to >= toIso(today);
}

export interface Filters {
  selection: Selection;
  granularity: Granularity;
  client?: string;
  driver?: string;
  vehicle?: string;
}

const param = (value: string | string[] | undefined) => (typeof value === 'string' && value ? value : undefined);

export function useAnalyticsFilters() {
  const router = useRouter();
  const { query } = router;
  // One „today” per mount, so preset ranges (and query keys) stay stable while the page is open.
  const [today] = React.useState(() => new Date());

  const view: View = query.tab === 'regular' || query.tab === 'agency' ? query.tab : 'overview';
  const granularity = GRANULARITY.find((item) => item.param === query.po)?.key ?? DEFAULT_GRANULARITY;
  const preset = PRESETS.find((item) => item.key === query.razdoblje)?.key ?? DEFAULT_PRESET;
  const selection: Selection =
    isIsoDate(query.od) && isIsoDate(query.do) && query.od <= query.do ? { from: query.od, to: query.do } : { preset };

  const filters: Filters = {
    selection,
    granularity,
    client: view === 'overview' ? param(query.klijent) : undefined,
    driver: view === 'regular' ? param(query.vozac) : undefined,
    vehicle: view === 'regular' && !param(query.vozac) ? param(query.vozilo) : undefined,
  };

  function toQuery(nextView: View, next: Filters) {
    const result: Record<string, string> = {};
    if (nextView !== 'overview') result.tab = nextView;
    if ('from' in next.selection) {
      result.od = next.selection.from;
      result.do = next.selection.to;
    } else if (next.selection.preset !== DEFAULT_PRESET) {
      result.razdoblje = next.selection.preset;
    }
    if (next.granularity !== DEFAULT_GRANULARITY) {
      result.po = GRANULARITY.find((item) => item.key === next.granularity)!.param;
    }
    if (next.client) result.klijent = next.client;
    if (next.driver) result.vozac = next.driver;
    else if (next.vehicle) result.vozilo = next.vehicle;
    return result;
  }

  function setView(next: View) {
    if (next === view) return;
    const { selection: nextSelection, granularity: nextGranularity } = filters;
    void router.push(
      { pathname: router.pathname, query: toQuery(next, { selection: nextSelection, granularity: nextGranularity }) },
      undefined,
      { shallow: true }
    );
  }

  function setFilters(patch: Partial<Filters>) {
    void router.replace({ pathname: router.pathname, query: toQuery(view, { ...filters, ...patch }) }, undefined, {
      shallow: true,
      scroll: false,
    });
  }

  return { isReady: router.isReady, today, view, filters, setView, setFilters };
}
