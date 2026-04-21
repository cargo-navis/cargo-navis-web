import { PositionEnum } from '@/lib/api/employees.d';
import type { IconType } from '@/ui/components/Icon';

export interface NavLink {
  name: string;
  href: string;
  icon: IconType;
  subItems?: NavLink[];
  allowedPositions?: PositionEnum[];
}

export const links: NavLink[] = [
  { name: 'Početna', href: '/dashboard', icon: 'HomeIcon' },
  // { name: 'Trucks Capacity', href: '/dashboard/capacity', icon: 'TruckIcon' }, // TODO
  // { name: 'Warehouse', href: '/dashboard/warehouses', icon: 'HomeModernIcon' }, // TODO
  // { name: 'Loading Planer', href: '/loading-planer', icon: HomeIcon }, // TODO
  {
    name: 'Nalozi',
    href: '/dashboard/shipments/',
    icon: 'DocumentTextIcon',
    subItems: [{ name: 'Novi Nalog', href: '/dashboard/shipments/new', icon: 'PlusIcon' }],
  },
  {
    name: 'Prijevozi',
    href: '/dashboard/vehicle-stops',
    icon: 'StopCircleIcon',
  },
  {
    name: 'Flota',
    href: '/dashboard/fleet/overview',
    icon: 'TruckIcon',
    subItems: [
      { name: 'Tegljači', href: '/dashboard/fleet/trucks', icon: 'ChevronRightIcon' },
      { name: 'Poluprikolice', href: '/dashboard/fleet/trailers', icon: 'ChevronRightIcon' },
      { name: 'Solo Kamioni', href: '/dashboard/fleet/solo-trucks', icon: 'ChevronRightIcon' },
      { name: 'Kombiji', href: '/dashboard/fleet/vans', icon: 'ChevronRightIcon' },
    ],
  },
  {
    name: 'Klijenti',
    href: '/dashboard/clients',
    icon: 'BriefcaseIcon',
  },
  {
    name: 'Kontraktori',
    href: '/dashboard/contractors',
    icon: 'ClipboardDocumentListIcon',
  },
  // { name: 'Assign Trucks', href: '/dashboard/assign-trucks', icon: 'SquaresPlusIcon' }, // TODO
  { name: 'Zaposlenici', href: '/dashboard/employees', icon: 'UserGroupIcon' },
  {
    name: 'Analitika',
    href: '/dashboard/analytics',
    icon: 'ChartBarIcon',
  },
];
