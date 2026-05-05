import { PositionEnum } from '@/lib/api/employees.d';
import { IconType } from '@/ui';

export interface NavLink {
  name: string;
  href: string;
  icon: IconType;
  subItems?: NavLink[];
  allowedPositions?: PositionEnum[];
}

export const links: NavLink[] = [
  { name: 'Početna', href: '/dashboard', icon: 'IconHome' },
  // { name: 'Trucks Capacity', href: '/dashboard/capacity', icon: 'TruckIcon' }, // TODO
  // { name: 'Warehouse', href: '/dashboard/warehouses', icon: 'HomeModernIcon' }, // TODO
  // { name: 'Loading Planer', href: '/loading-planer', icon: HomeIcon }, // TODO
  {
    name: 'Nalozi',
    href: '/dashboard/shipments/',
    icon: 'IconFileDescription',
    subItems: [{ name: 'Novi Nalog', href: '/dashboard/shipments/new', icon: 'IconPlus' }],
  },
  {
    name: 'Prijevozi',
    href: '/dashboard/vehicle-stops',
    icon: 'IconTruckDelivery',
  },
  {
    name: 'Flota',
    href: '/dashboard/fleet/overview',
    icon: 'IconTruck',
    subItems: [
      { name: 'Tegljači', href: '/dashboard/fleet/trucks', icon: 'IconChevronRight' },
      { name: 'Poluprikolice', href: '/dashboard/fleet/trailers', icon: 'IconChevronRight' },
      { name: 'Solo Kamioni', href: '/dashboard/fleet/solo-trucks', icon: 'IconChevronRight' },
      { name: 'Kombiji', href: '/dashboard/fleet/vans', icon: 'IconChevronRight' },
    ],
  },
  {
    name: 'Klijenti',
    href: '/dashboard/clients',
    icon: 'IconBriefcase',
  },
  {
    name: 'Kontraktori',
    href: '/dashboard/contractors',
    icon: 'IconLicense',
  },
  // { name: 'Assign Trucks', href: '/dashboard/assign-trucks', icon: 'SquaresPlusIcon' }, // TODO
  { name: 'Zaposlenici', href: '/dashboard/employees', icon: 'IconUsers' },
  {
    name: 'Analitika',
    href: '/dashboard/analytics',
    icon: 'IconChartBar',
  },
];
