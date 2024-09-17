import type { IconType } from '@/ui/components/Icon';

export interface NavLink {
  name: string;
  href: string;
  icon: IconType;
  subItems?: NavLink[];
}

export const links: NavLink[] = [
  { name: 'Home', href: '/dashboard', icon: 'HomeIcon' },
  { name: 'Trucks Capacity', href: '/dashboard/capacity', icon: 'TruckIcon' },
  { name: 'Shipments', href: '/dashboard/shipments', icon: 'CubeTransparentIcon' },
  { name: 'Warehouse', href: '/dashboard/warehouses', icon: 'HomeModernIcon' },
  // { name: 'Loading Planer', href: '/loading-planer', icon: HomeIcon }, // TODO
  {
    name: 'Fleet',
    href: '/dashboard/fleet',
    icon: 'TruckIcon',
    subItems: [
      { name: 'Trucks', href: '/dashboard/fleet/trucks', icon: 'ChevronRightIcon' },
      { name: 'Trailers', href: '/dashboard/fleet/trailer', icon: 'ChevronRightIcon' },
      { name: 'Solo Trucks', href: '/dashboard/fleet/solo', icon: 'ChevronRightIcon' },
      { name: 'Vans', href: '/dashboard/fleet/van', icon: 'ChevronRightIcon' },
    ],
  },
  { name: 'Assign Trucks', href: '/dashboard/assign-trucks', icon: 'SquaresPlusIcon' },
  { name: 'Employees', href: '/dashboard/employees', icon: 'UserGroupIcon' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: 'PresentationChartLineIcon' },
];
