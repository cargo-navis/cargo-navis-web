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

type CrumbKey = NavSection | 'settings' | 'search' | 'notifications';

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
  notifications: { label: 'Obavijesti', href: '/dashboard/notifications' },
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
  '/dashboard/notifications': [CRUMBS.notifications],
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
  ...crudRoutes('/dashboard/fleet', CRUMBS.fleet, { new: 'Novo vozilo', one: 'Vozilo', edit: 'Uredi vozilo' }),
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
