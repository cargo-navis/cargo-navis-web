import {
  CubeTransparentIcon,
  HomeIcon,
  HomeModernIcon, PresentationChartLineIcon,
  SquaresPlusIcon,
  TruckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export interface NavLink {
  name: string;
  href: string;
  icon: any;
}

export const links: NavLink[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Trucks Capacity', href: '/dashboard/capacity', icon: TruckIcon },
  { name: 'Shipments', href: '/dashboard/shipments', icon: CubeTransparentIcon },
  { name: 'Warehouse', href: '/dashboard/warehouse', icon: HomeModernIcon },
  // { name: 'Loading Planer', href: '/loading-planer', icon: HomeIcon }, // TODO
  { name: 'Fleet', href: '/dashboard/fleet', icon: TruckIcon },
  { name: 'Assign Trucks', href: '/assign/dashboard-trucks', icon: SquaresPlusIcon },
  { name: 'Employees', href: '/dashboard/employees', icon: UserGroupIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PresentationChartLineIcon },
];