import { NAV, type NavSection, SETTINGS_ACCOUNT_HREF } from './nav';

/**
 * One breadcrumb. The last crumb is the current page (its `href` is ignored); earlier ones link with `href`.
 *
 *   <DashboardLayout breadcrumbs={[CRUMBS.shipments, { label: shipment.orderNumber }]}>
 */
export interface Crumb {
  label: string;
  href?: string;
}

type CrumbKey = NavSection | 'settings' | 'search' | 'trucks' | 'trailers' | 'soloTrucks' | 'vans';

const navCrumb = (key: NavSection): Crumb => {
  const item = NAV.find((nav) => nav.key === key)!;
  return { label: item.label, href: item.href };
};

/** Section crumbs with their links, for pages that build their own trail. */
export const CRUMBS: Record<CrumbKey, Crumb> = {
  home: navCrumb('home'),
  shipments: navCrumb('shipments'),
  vehicleStops: navCrumb('vehicleStops'),
  fleet: navCrumb('fleet'),
  clients: navCrumb('clients'),
  contractors: navCrumb('contractors'),
  employees: navCrumb('employees'),
  analytics: navCrumb('analytics'),
  settings: { label: 'Postavke', href: SETTINGS_ACCOUNT_HREF },
  search: { label: 'Pretraga', href: '/dashboard/search' },
  trucks: { label: 'Tegljači', href: '/dashboard/fleet/trucks' },
  trailers: { label: 'Poluprikolice', href: '/dashboard/fleet/trailers' },
  soloTrucks: { label: 'Solo kamioni', href: '/dashboard/fleet/solo-trucks' },
  vans: { label: 'Kombiji', href: '/dashboard/fleet/vans' },
};

/** CRUD routes of a list section: list, new, detail, edit (labels are generic until the page passes a name). */
function crudRoutes(
  base: string,
  section: Crumb,
  labels: { new: string; one: string; edit: string },
  parents: Crumb[] = []
) {
  return {
    [base]: [...parents, section],
    [`${base}/new`]: [...parents, section, { label: labels.new }],
    [`${base}/[id]`]: [...parents, section, { label: labels.one }],
    [`${base}/[id]/edit`]: [...parents, section, { label: labels.edit }],
  };
}

/** Default trail per route (Next `router.pathname`), used when a page passes no `breadcrumbs`. */
const ROUTE_CRUMBS: Record<string, Crumb[]> = {
  '/dashboard': [CRUMBS.home],
  '/dashboard/analytics': [CRUMBS.analytics],
  '/dashboard/search': [CRUMBS.search],
  '/dashboard/settings/account': [CRUMBS.settings, { label: 'Moj račun' }],
  '/dashboard/settings/company': [CRUMBS.settings, { label: 'Tvrtka' }],
  '/dashboard/shipments': [CRUMBS.shipments],
  '/dashboard/shipments/new': [CRUMBS.shipments, { label: 'Novi nalog' }],
  '/dashboard/shipments/[id]': [CRUMBS.shipments, { label: 'Nalog' }],
  '/dashboard/shipments/[id]/edit': [CRUMBS.shipments, { label: 'Uredi nalog' }],
  '/dashboard/vehicle-stops': [CRUMBS.vehicleStops],
  '/dashboard/vehicle-stops/[vehicleId]': [CRUMBS.vehicleStops, { label: 'Ruta' }],
  '/dashboard/vehicle-stops/stop/[stopId]': [CRUMBS.vehicleStops],
  '/dashboard/fleet': [CRUMBS.fleet],
  '/dashboard/fleet/overview': [CRUMBS.fleet],
  ...crudRoutes(
    '/dashboard/fleet/trucks',
    CRUMBS.trucks,
    { new: 'Novi tegljač', one: 'Tegljač', edit: 'Uredi tegljač' },
    [CRUMBS.fleet]
  ),
  ...crudRoutes(
    '/dashboard/fleet/trailers',
    CRUMBS.trailers,
    { new: 'Nova poluprikolica', one: 'Poluprikolica', edit: 'Uredi poluprikolicu' },
    [CRUMBS.fleet]
  ),
  ...crudRoutes(
    '/dashboard/fleet/solo-trucks',
    CRUMBS.soloTrucks,
    { new: 'Novi solo kamion', one: 'Solo kamion', edit: 'Uredi solo kamion' },
    [CRUMBS.fleet]
  ),
  ...crudRoutes('/dashboard/fleet/vans', CRUMBS.vans, { new: 'Novi kombi', one: 'Kombi', edit: 'Uredi kombi' }, [
    CRUMBS.fleet,
  ]),
  ...crudRoutes('/dashboard/clients', CRUMBS.clients, { new: 'Novi klijent', one: 'Klijent', edit: 'Uredi klijenta' }),
  ...crudRoutes('/dashboard/contractors', CRUMBS.contractors, {
    new: 'Novi kontraktor',
    one: 'Kontraktor',
    edit: 'Uredi kontraktora',
  }),
  ...crudRoutes('/dashboard/employees', CRUMBS.employees, {
    new: 'Novi zaposlenik',
    one: 'Zaposlenik',
    edit: 'Uredi zaposlenika',
  }),
};

export function getRouteBreadcrumbs(pathname: string): Crumb[] {
  const known = ROUTE_CRUMBS[pathname];
  if (known) return known;

  const section = NAV.find((item) => item.key !== 'home' && item.match(pathname));
  return section ? [navCrumb(section.key)] : [];
}
