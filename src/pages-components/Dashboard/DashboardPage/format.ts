import 'dayjs/locale/hr';

import dayjs from 'dayjs';

import { daysFromToday, formatDate, formatDateShort, formatTime } from '@/lib/utils/date';

/** Aktivnost: „upravo”, „prije 12 min”, „prije 2 h”, „jučer 18:20”, „7.11. 08:42”, „7.11.2025.” (other years). */
export function formatAgo(value: string | Date, now: Date = new Date()) {
  const minutes = Math.floor((now.getTime() - new Date(value).getTime()) / 60_000);
  const days = daysFromToday(value, now);
  if (days === 0 && minutes < 1) return 'upravo';
  if (days === 0 && minutes < 60) return `prije ${minutes} min`;
  if (days === 0) return `prije ${Math.floor(minutes / 60)} h`;
  if (days === -1) return `jučer ${formatTime(value)}`;
  return dayjs(value).year() === now.getFullYear()
    ? `${formatDateShort(value)} ${formatTime(value)}`
    : formatDate(value);
}

/** „utorak, 10. studenoga” (the „Danas” panel title). */
export function formatLongToday(now: Date = new Date()) {
  return dayjs(now).locale('hr').format('dddd, D[.] MMMM');
}

/** „Dobro jutro” until noon, „Dobar dan” until 18h, then „Dobra večer”. */
export function greeting(now: Date = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Dobro jutro';
  if (hour < 18) return 'Dobar dan';
  return 'Dobra večer';
}

/** Pon … Ned for the 7-day sparkline. */
const WEEKDAYS = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
export const weekdayShort = (date: Date) => WEEKDAYS[date.getDay()];
