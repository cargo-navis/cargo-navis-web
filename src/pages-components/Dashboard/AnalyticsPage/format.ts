import 'dayjs/locale/hr';

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import type { Granularity } from '@/lib/api';
import { formatDate, formatDateShort } from '@/lib/utils/date';

dayjs.extend(isoWeek);

/** „61.800 €” (whole euros). */
export const eur = (value: number) =>
  new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

/** „1.234” */
export const int = (value: number) => Math.round(value).toLocaleString('hr-HR');

/** Axis ticks: „62 tis.” */
export const compact = (value: number) => new Intl.NumberFormat('hr-HR', { notation: 'compact' }).format(value);

/** „12,3 %” */
export const percent = (value: number) =>
  `${value.toLocaleString('hr-HR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %`;

const MONTHS = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
const MONTHS_LONG = [
  'siječanj',
  'veljača',
  'ožujak',
  'travanj',
  'svibanj',
  'lipanj',
  'srpanj',
  'kolovoz',
  'rujan',
  'listopad',
  'studeni',
  'prosinac',
];

/** „ ’25” after a short label from another year than the current one. */
const yearSuffix = (year: number, now: Date) => (year === now.getFullYear() ? '' : ` ’${String(year).slice(2)}`);

export interface PeriodLabel {
  /** On the axis: „10.11.”, „T46”, „Stu”, „2026”. */
  label: string;
  /** In the tooltip and the table view: „utorak, 10.11.2026.”, „46. tjedan 2026. · 9.11. – 15.11.2026.” … */
  long: string;
}

/**
 * Labels for an API period: day „2026-11-10”, week „2026-11-09 - 2026-11-15”, month „2026-11”, year „2026”.
 */
export function periodLabel(period: string, granularity: Granularity, now = new Date()): PeriodLabel {
  switch (granularity) {
    case 'day': {
      const day = dayjs(period);
      return {
        label: formatDateShort(day.toDate()),
        long: `${day.locale('hr').format('dddd')}, ${formatDate(period)}`,
      };
    }
    case 'week': {
      const [startText, endText] = period.split(' - ');
      const start = dayjs(startText);
      const end = endText ? dayjs(endText) : start.add(6, 'day');
      const week = start.isoWeek();
      const year = start.isoWeekYear();
      return {
        label: `T${week}${yearSuffix(year, now)}`,
        long: `${week}. tjedan ${year}. · ${formatDateShort(start.toDate())} – ${formatDate(end.toDate())}`,
      };
    }
    case 'month': {
      const month = dayjs(`${period}-01`);
      return {
        label: `${MONTHS[month.month()]}${yearSuffix(month.year(), now)}`,
        long: `${MONTHS_LONG[month.month()]} ${month.year()}.`,
      };
    }
    case 'year':
      return { label: period, long: `${period}.` };
  }
}
