import type { IconType } from '@/ui/components/Icon';

export interface NavLink {
  name: string;
  href: string;
  icon: IconType;
  subItems?: NavLink[];
}

export const links: NavLink[] = [
  { name: 'Home', href: '/dashboard', icon: 'HomeIcon' },
  // { name: 'Trucks Capacity', href: '/dashboard/capacity', icon: 'TruckIcon' }, // TODO
  // { name: 'Shipments', href: '/dashboard/shipments', icon: 'CubeTransparentIcon' }, // TODO
  // { name: 'Warehouse', href: '/dashboard/warehouses', icon: 'HomeModernIcon' }, // TODO
  // { name: 'Loading Planer', href: '/loading-planer', icon: HomeIcon }, // TODO
  {
    name: 'Fleet',
    href: '/dashboard/fleet/overview',
    icon: 'TruckIcon',
    subItems: [
      { name: 'Trucks', href: '/dashboard/fleet/trucks', icon: 'ChevronRightIcon' },
      { name: 'Trailers', href: '/dashboard/fleet/trailers', icon: 'ChevronRightIcon' },
      { name: 'Solo Trucks', href: '/dashboard/fleet/solo-trucks', icon: 'ChevronRightIcon' },
      { name: 'Vans', href: '/dashboard/fleet/vans', icon: 'ChevronRightIcon' },
    ],
  },
  // { name: 'Assign Trucks', href: '/dashboard/assign-trucks', icon: 'SquaresPlusIcon' }, // TODO
  { name: 'Employees', href: '/dashboard/employees', icon: 'UserGroupIcon' },
  // { name: 'Analytics', href: '/dashboard/analytics', icon: 'PresentationChartLineIcon' }, // TODO
];
