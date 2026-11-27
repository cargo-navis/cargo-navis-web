import 'dayjs/locale/hr';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';

import { DAYS, pluralCount } from './plural';

dayjs.extend(advancedFormat);
dayjs.extend(utc);

export enum DateTimeFormat {
  IsoShort = 'YYYY-MM-DD',
  MilitaryTime = 'HHmm',
}

export function formatDateString(date: string, dateFormat = 'MMM D, YYYY') {
  return dayjs(date).format(dateFormat);
}

export function isToday(date?: string) {
  return !!date && dayjs(date).isSame(dayjs(), 'day');
}

// ---------------------------------------------------------------------------------------------------------------------
// KAN-55 · one date format for the whole app (DECISIONS §1 Dates): „7.11.2026.” full, „7.11.” short, no leading zeros,
// no spaces. Relative words where they help. Inputs: Date, ISO string ('2026-11-07' = local midnight) or timestamp.
// ---------------------------------------------------------------------------------------------------------------------

export type DateInput = Date | string | number;

/** „7.11.2026.” */
export function formatDate(date: DateInput) {
  const day = dayjs(date);
  return `${day.date()}.${day.month() + 1}.${day.year()}.`;
}

/** „7.11.” */
export function formatDateShort(date: DateInput) {
  const day = dayjs(date);
  return `${day.date()}.${day.month() + 1}.`;
}

/** „ponedjeljak” (Croatian weekday, lower case). */
export function formatWeekday(date: DateInput) {
  return dayjs(date).locale('hr').format('dddd');
}

/** „08:42” (local time). */
export function formatTime(date: DateInput) {
  return dayjs(date).format('HH:mm');
}

/** „7.11.2026. 08:42”, or „7.11. 08:42” with `short`. */
export function formatDateTime(date: DateInput, { short = false }: { short?: boolean } = {}) {
  return `${short ? formatDateShort(date) : formatDate(date)} ${formatTime(date)}`;
}

/** Calendar days from today (local): 0 today, 1 tomorrow, -1 yesterday. */
export function daysFromToday(date: DateInput, now: DateInput = new Date()) {
  return dayjs(date).startOf('day').diff(dayjs(now).startOf('day'), 'day');
}

/** „danas”, „sutra”, „jučer”, „za 3 dana”, „prije 2 dana”. */
export function formatRelativeDay(date: DateInput, now: DateInput = new Date()) {
  const days = daysFromToday(date, now);
  if (days === 0) return 'danas';
  if (days === 1) return 'sutra';
  if (days === -1) return 'jučer';
  return days > 0 ? `za ${pluralCount(days, DAYS)}` : `prije ${pluralCount(-days, DAYS)}`;
}

/**
 * „Kasni 2 dana” (`short`: „Kasni 2 d”, for badges and table cells); just „Kasni” for 0 days or less.
 * `daysLate` = days past the planned date / due date.
 */
export function formatLate(daysLate: number, { short = false }: { short?: boolean } = {}) {
  if (daysLate <= 0) return 'Kasni';
  return short ? `Kasni ${daysLate} d` : `Kasni ${pluralCount(daysLate, DAYS)}`;
}

/** Expiry warnings start this many days ahead (DECISIONS §1 Dates). */
export const EXPIRY_SOON_DAYS = 30;

export type ExpiryState = 'expired' | 'soon' | 'ok' | 'missing';

/** Documents, deadlines, insurance: expired (before today), soon (today … 30 days), ok, or missing (no date). */
export function getExpiryState(date: DateInput | null | undefined, now: DateInput = new Date()): ExpiryState {
  if (date === null || date === undefined || date === '') return 'missing';
  const days = daysFromToday(date, now);
  if (days < 0) return 'expired';
  return days <= EXPIRY_SOON_DAYS ? 'soon' : 'ok';
}

/** „Isteklo prije 8 d”, „Istječe danas”, „Istječe za 18 d”; null when the date is missing or far enough away. */
export function formatExpiry(date: DateInput | null | undefined, now: DateInput = new Date()) {
  const state = getExpiryState(date, now);
  if (state === 'missing' || state === 'ok') return null;
  const days = daysFromToday(date!, now);
  if (state === 'expired') return `Isteklo prije ${-days} d`;
  return days === 0 ? 'Istječe danas' : `Istječe za ${days} d`;
}
