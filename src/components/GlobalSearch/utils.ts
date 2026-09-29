import { type GlobalSearchResults, VehicleEnum } from '@/lib/api';
import type { IconType } from '@/ui';

export interface SearchResultItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
}

export interface SearchResultGroup {
  key: keyof GlobalSearchResults;
  heading: string;
  icon: IconType;
  items: SearchResultItem[];
}

const fleetPathMap: Record<VehicleEnum, string> = {
  [VehicleEnum.TRUCK]: 'trucks',
  [VehicleEnum.TRAILER]: 'trailers',
  [VehicleEnum.SOLO_TRUCK]: 'solo-trucks',
  [VehicleEnum.VAN]: 'vans',
};

const fleetTypeLabelMap: Record<VehicleEnum, string> = {
  [VehicleEnum.TRUCK]: 'Tegljač',
  [VehicleEnum.TRAILER]: 'Poluprikolica',
  [VehicleEnum.SOLO_TRUCK]: 'Solo kamion',
  [VehicleEnum.VAN]: 'Kombi',
};

function joinDefined(...parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(' • ') || undefined;
}

// Icons mirror the sidebar nav links (see layout/DashboardLayout/data.ts)
export function mapToSearchResultGroups(results: GlobalSearchResults): SearchResultGroup[] {
  const groups: SearchResultGroup[] = [
    {
      key: 'shipments',
      heading: 'Nalozi',
      icon: 'IconFileDescription',
      items: results.shipments.items.map((s) => ({
        id: s.id,
        href: `/dashboard/shipments/${s.id}`,
        title: s.orderNumber,
        subtitle: joinDefined(s.clientName ?? s.transportContractorName, s.externalOrderReference),
      })),
    },
    {
      key: 'fleet',
      heading: 'Flota',
      icon: 'IconTruck',
      items: results.fleet.items.map((v) => ({
        id: v.id,
        href: `/dashboard/fleet/${fleetPathMap[v.fleetType]}/${v.id}`,
        title: v.registration,
        subtitle: joinDefined(fleetTypeLabelMap[v.fleetType], v.brand),
      })),
    },
    {
      key: 'employees',
      heading: 'Zaposlenici',
      icon: 'IconUsers',
      items: results.employees.items.map((e) => ({
        id: e.id,
        href: `/dashboard/employees/${e.id}`,
        title: `${e.firstName} ${e.lastName}`,
        subtitle: joinDefined(e.email, e.phoneNumber?.value),
      })),
    },
    {
      key: 'clients',
      heading: 'Klijenti',
      icon: 'IconBriefcase',
      items: results.clients.items.map((c) => ({
        id: c.id,
        href: `/dashboard/clients/${c.id}`,
        title: c.name,
        subtitle: joinDefined(c.vatNumber),
      })),
    },
    {
      key: 'contractors',
      heading: 'Kontraktori',
      icon: 'IconLicense',
      items: results.contractors.items.map((c) => ({
        id: c.id,
        href: `/dashboard/contractors/${c.id}`,
        title: c.name,
        subtitle: joinDefined(c.vatNumber),
      })),
    },
  ];

  return groups.filter((group) => group.items.length > 0);
}
