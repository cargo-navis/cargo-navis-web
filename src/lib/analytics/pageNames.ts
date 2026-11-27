/**
 * A readable Croatian name for every dashboard page (KAN-134, 2026-11-27): sent as `page_name` on every event (page
 * views, actions, clicks), so PostHog insights can break down by „Nalozi” instead of `/dashboard/shipments`, and every nalog
 * counts as one „Nalog” instead of one URL per id. Keep in step with src/pages/dashboard (a missing route sends no
 * name; the URL still is).
 */

/** Route pattern (`[x]` = any one segment) → name. */
const PAGES: [pattern: string, name: string][] = [
  ['/dashboard', 'Početna'],
  ['/dashboard/shipments', 'Nalozi'],
  ['/dashboard/shipments/new', 'Novi nalog'],
  ['/dashboard/shipments/[id]', 'Nalog'],
  ['/dashboard/shipments/[id]/edit', 'Uredi nalog'],
  ['/dashboard/shipments/[id]/assign', 'Dodijeli vozilo'],
  ['/dashboard/vehicle-stops', 'Prijevozi'],
  // Only resolves a stop's vehicle and replaces itself with its Ruta (notification links): not a Ruta view.
  ['/dashboard/vehicle-stops/stop/[stopId]', 'Ruta (redirecting...)'],
  ['/dashboard/vehicle-stops/[vehicleId]', 'Ruta'],
  ['/dashboard/fleet', 'Flota'],
  ['/dashboard/fleet/new', 'Novo vozilo'],
  ['/dashboard/fleet/[id]', 'Vozilo'],
  ['/dashboard/fleet/[id]/edit', 'Uredi vozilo'],
  ['/dashboard/clients', 'Klijenti'],
  ['/dashboard/clients/new', 'Novi klijent'],
  ['/dashboard/clients/[id]', 'Klijent'],
  ['/dashboard/clients/[id]/edit', 'Uredi klijenta'],
  ['/dashboard/contractors', 'Podvozari'],
  ['/dashboard/contractors/new', 'Novi podvozar'],
  ['/dashboard/contractors/[id]', 'Podvozar'],
  ['/dashboard/contractors/[id]/edit', 'Uredi podvozara'],
  ['/dashboard/employees', 'Zaposlenici'],
  ['/dashboard/employees/new', 'Novi zaposlenik'],
  ['/dashboard/employees/[id]', 'Zaposlenik'],
  ['/dashboard/employees/[id]/edit', 'Uredi zaposlenika'],
  ['/dashboard/analytics', 'Analitika'],
  ['/dashboard/notifications', 'Obavijesti'],
  ['/dashboard/search', 'Pretraga'],
  ['/dashboard/settings/account', 'Postavke · Moj račun'],
  ['/dashboard/settings/company', 'Postavke · Tvrtka'],
];

const segments = (path: string) => path.split('/').filter(Boolean);

function matches(pattern: string, path: string) {
  const [want, got] = [segments(pattern), segments(path)];
  return want.length === got.length && want.every((part, index) => part.startsWith('[') || part === got[index]);
}

/**
 * The page's name from its URL (path + query; a trailing slash is ignored). Exact segments win over `[id]` (the list
 * order: „new” comes before „[id]”). Nalozi with `?tab=drafts` is „Nalozi u pripremi”.
 */
export function pageNameOf(url: string): string | undefined {
  const { pathname, searchParams } = new URL(url, 'https://app.local');
  const name = PAGES.find(([pattern]) => matches(pattern, pathname))?.[1];
  if (name === 'Nalozi' && searchParams.get('tab') === 'drafts') return 'Nalozi u pripremi';
  return name;
}
