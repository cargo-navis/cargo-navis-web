import type { IconType } from '@/ui';

/**
 * 404 copy and decisions (KAN-55, lab /lab-404, decided 2026-11-20). Pure, so it is unit tested; the components are
 * in not-found.tsx and pages-components/NotFoundPage.
 * - In the app, the page knows what was missing: D „Kontekstualno” (`ENTITY_NOT_FOUND`), list + create.
 * - In the app, any other unknown /dashboard path: A „Mirno” (`PAGE_NOT_FOUND`).
 * - Outside the app (signed out, not /dashboard): B „Ruta” (`ROUTE_NOT_FOUND`).
 */

/** What an entity page can fail to find. */
export type EntityKind = 'shipment' | 'vehicle' | 'employee' | 'client' | 'contractor';

export interface EntityNotFoundCopy {
  icon: IconType;
  title: string;
  description: string;
  list: { label: string; href: string };
  create: { label: string; href: string };
}

/** D „Kontekstualno”: title and description agree with the noun's gender (nalog / vozilo …). */
export const ENTITY_NOT_FOUND: Record<EntityKind, EntityNotFoundCopy> = {
  shipment: {
    icon: 'IconFileOff',
    title: 'Nalog nije pronađen',
    description: 'Možda je obrisan.',
    list: { label: 'Svi nalozi', href: '/dashboard/shipments' },
    create: { label: 'Novi nalog', href: '/dashboard/shipments/new' },
  },
  vehicle: {
    icon: 'IconTruckOff',
    title: 'Vozilo nije pronađeno',
    description: 'Možda je obrisano.',
    list: { label: 'Sva vozila', href: '/dashboard/fleet' },
    // No ?vrsta=: the form opens on tegljač with the type picker.
    create: { label: 'Dodaj vozilo', href: '/dashboard/fleet/new' },
  },
  employee: {
    icon: 'IconUserOff',
    title: 'Zaposlenik nije pronađen',
    description: 'Možda je obrisan.',
    list: { label: 'Svi zaposlenici', href: '/dashboard/employees' },
    create: { label: 'Dodaj zaposlenika', href: '/dashboard/employees/new' },
  },
  client: {
    icon: 'IconBriefcaseOff',
    title: 'Klijent nije pronađen',
    description: 'Možda je obrisan.',
    list: { label: 'Svi klijenti', href: '/dashboard/clients' },
    create: { label: 'Dodaj klijenta', href: '/dashboard/clients/new' },
  },
  contractor: {
    // Tabler has no TruckLoadingOff (and TruckOff is the vehicle's): the podvozar icon itself.
    icon: 'IconTruckLoading',
    title: 'Podvozar nije pronađen',
    description: 'Možda je obrisan.',
    list: { label: 'Svi podvozari', href: '/dashboard/contractors' },
    create: { label: 'Dodaj podvozara', href: '/dashboard/contractors/new' },
  },
};

/** A „Mirno”: an unknown /dashboard path. */
export const PAGE_NOT_FOUND = {
  icon: 'IconMapPinOff' as IconType,
  title: 'Ova stranica ne postoji',
  description: 'Možda je link zastario ili je sadržaj obrisan.',
  crumb: 'Stranica ne postoji',
  home: { label: 'Na Početnu', href: '/dashboard' },
  back: 'Natrag',
};

/** B „Ruta”: outside the app. „Na Početnu” → / sends a signed-out user on to /login. */
export const ROUTE_NOT_FOUND = {
  code: '404',
  title: 'Skrenuli smo s rute.',
  description: PAGE_NOT_FOUND.description,
  home: { label: 'Na Početnu', href: '/' },
  back: 'Natrag',
};

/**
 * Which 404 a path gets. Only the path: the access token lives in memory, so a fresh load can't know about the session.
 * Signed out, a /dashboard path still renders the shell, whose user query sends them to /login.
 */
export function notFoundContext(pathname: string): 'app' | 'outside' {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/') ? 'app' : 'outside';
}

/** True only when the API answered 404; other failures keep the page's „Pokušaj ponovno” error state. */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('response' in error)) return false;
  const response = (error as { response?: { status?: unknown } }).response;
  return response?.status === 404;
}

/** The path for the D block's code line: no query or hash. */
export function displayPath(asPath: string): string {
  return asPath.split(/[?#]/)[0] || '/';
}
