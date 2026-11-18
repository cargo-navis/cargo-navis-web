import { PositionEnum } from '@/lib/api/employees';
import type { IconType } from '@/ui';

/** One sidebar item (DECISIONS §4, lab /dashboard app-sidebar.tsx). */
export interface NavItem {
  key: NavSection;
  label: string;
  href: string;
  icon: IconType;
  /** Route prefixes (Next `router.pathname`) that mark the item active. */
  match: (pathname: string) => boolean;
  /** Shown as a + on hover („Novi nalog”). */
  action?: { label: string; href: string };
  /** Positions that see the item; everyone when empty. */
  allowedPositions?: PositionEnum[];
}

export type NavSection =
  | 'home'
  | 'shipments'
  | 'vehicleStops'
  | 'fleet'
  | 'clients'
  | 'contractors'
  | 'employees'
  | 'analytics';

const startsWith = (prefix: string) => (pathname: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Početna, Nalozi (+ „Novi nalog” on hover), Prijevozi, Flota (one item), Klijenti, Kontraktori, Zaposlenici,
 * Analitika. No „Postavke” item: Postavke open from the company name (Tvrtka) and the user menu (Moj račun).
 */
export const NAV: NavItem[] = [
  {
    key: 'home',
    label: 'Početna',
    href: '/dashboard',
    icon: 'IconHome',
    match: (pathname) => pathname === '/dashboard',
  },
  {
    key: 'shipments',
    label: 'Nalozi',
    href: '/dashboard/shipments',
    icon: 'IconFileDescription',
    match: startsWith('/dashboard/shipments'),
    action: { label: 'Novi nalog', href: '/dashboard/shipments/new' },
  },
  {
    key: 'vehicleStops',
    label: 'Prijevozi',
    href: '/dashboard/vehicle-stops',
    icon: 'IconTruckDelivery',
    match: startsWith('/dashboard/vehicle-stops'),
  },
  // One item; /dashboard/fleet is today's fleet overview until the one-page Flota (PR 7) replaces that page.
  { key: 'fleet', label: 'Flota', href: '/dashboard/fleet', icon: 'IconTruck', match: startsWith('/dashboard/fleet') },
  {
    key: 'clients',
    label: 'Klijenti',
    href: '/dashboard/clients',
    icon: 'IconBriefcase',
    match: startsWith('/dashboard/clients'),
  },
  {
    key: 'contractors',
    label: 'Kontraktori',
    href: '/dashboard/contractors',
    icon: 'IconLicense',
    match: startsWith('/dashboard/contractors'),
  },
  {
    key: 'employees',
    label: 'Zaposlenici',
    href: '/dashboard/employees',
    icon: 'IconUsers',
    match: startsWith('/dashboard/employees'),
  },
  {
    key: 'analytics',
    label: 'Analitika',
    href: '/dashboard/analytics',
    icon: 'IconChartBar',
    match: startsWith('/dashboard/analytics'),
  },
];

export function canAccessNavItem(item: NavItem, userPositions: PositionEnum[] | undefined): boolean {
  if (!item.allowedPositions || item.allowedPositions.length === 0) return true;
  if (!userPositions || userPositions.length === 0) return false;
  return item.allowedPositions.some((position) => userPositions.includes(position));
}

export const POSITION_LABELS: Record<PositionEnum, string> = {
  [PositionEnum.Ceo]: 'CEO',
  [PositionEnum.Manager]: 'Menadžer',
  [PositionEnum.Dispatcher]: 'Disponent',
  [PositionEnum.Driver]: 'Vozač',
};

export const SETTINGS_ACCOUNT_HREF = '/dashboard/settings/account';
export const SETTINGS_COMPANY_HREF = '/dashboard/settings/company';
