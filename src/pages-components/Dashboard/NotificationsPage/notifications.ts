import dayjs from 'dayjs';

import { SETTINGS_COMPANY_HREF } from '@/components/layout/DashboardLayout/nav';
import { daysFromToday, formatDate, formatDateShort } from '@/lib/utils/date';

import type { Warning, WarningKind } from '../DashboardPage/warnings';

export type NotificationsTab = 'paznja' | 'aktivnost';

export const NOTIFICATIONS_HREF = '/dashboard/notifications';

/** `/dashboard/notifications?tab=…` (Početna's „Još N…”, the bell's „Vidi više”). */
export const notificationsHref = (tab: NotificationsTab) => `${NOTIFICATIONS_HREF}?tab=${tab}`;

/** `?tab=` → tab; anything else is „Treba pažnju”. */
export const tabFromQuery = (value: unknown): NotificationsTab => (value === 'aktivnost' ? 'aktivnost' : 'paznja');

/** „Treba pažnju” groups, in this order, each with a link to the list that owns its items (lab /notifications). */
export const WARNING_GROUPS: { kind: WarningKind; label: string; list: { label: string; href: string } }[] = [
  {
    kind: 'invoice',
    label: 'Fakture',
    list: { label: 'Svi u Nalozima', href: '/dashboard/shipments?isInvoiceOverdue=true' },
  },
  { kind: 'document', label: 'Zaposlenici', list: { label: 'Svi u Zaposlenicima', href: '/dashboard/employees' } },
  { kind: 'vehicle', label: 'Vozila', list: { label: 'Sva u Floti', href: '/dashboard/fleet' } },
  { kind: 'company', label: 'Tvrtka', list: { label: 'Postavke › Tvrtka', href: SETTINGS_COMPANY_HREF } },
];

/** Warnings per kind, keeping the order they come in (`sortWarnings`: most urgent first). */
export function groupWarnings<T extends Pick<Warning, 'kind'>>(warnings: T[]): Record<WarningKind, T[]> {
  const groups: Record<WarningKind, T[]> = { invoice: [], document: [], vehicle: [], company: [] };
  for (const warning of warnings) groups[warning.kind].push(warning);
  return groups;
}

export interface DayGroup<T> {
  /** `YYYY-MM-DD` (local). */
  key: string;
  /** „Danas”, „Jučer”, „17.11.”, „17.11.2025.” (other years). */
  label: string;
  items: T[];
}

export function dayLabel(date: string | Date, now: Date = new Date()) {
  const days = daysFromToday(date, now);
  if (days === 0) return 'Danas';
  if (days === -1) return 'Jučer';
  return dayjs(date).year() === now.getFullYear() ? formatDateShort(date) : formatDate(date);
}

/** Aktivnost: newest first, one group per calendar day. */
export function groupByDay<T extends { createdAt: string }>(items: T[], now: Date = new Date()): DayGroup<T>[] {
  const sorted = [...items].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  const groups: DayGroup<T>[] = [];
  for (const item of sorted) {
    const key = dayjs(item.createdAt).format('YYYY-MM-DD');
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(item.createdAt, now), items: [item] });
  }
  return groups;
}
