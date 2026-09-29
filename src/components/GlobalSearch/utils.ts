import { type GlobalSearchResults, SearchTypeEnum, VehicleEnum } from '@/lib/api';
import type { IconType } from '@/ui';

export type SearchCategoryKey = keyof GlobalSearchResults;

export interface SearchResultItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
}

export interface SearchCategory {
  key: SearchCategoryKey;
  type: SearchTypeEnum;
  heading: string;
  icon: IconType;
  // Genitive plural used in "Prikaži svih {total} {noun}"
  pluralNoun: string;
  mapItems(results: GlobalSearchResults): SearchResultItem[];
}

export interface SearchResultGroup {
  key: SearchCategoryKey;
  heading: string;
  icon: IconType;
  items: SearchResultItem[];
  // Present when the category has more matches than returned (total > items)
  showAll?: {
    href: string;
    label: string;
  };
}

export const SEARCH_PAGE_PATH = '/dashboard/search';

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

export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    key: 'shipments',
    type: SearchTypeEnum.SHIPMENTS,
    heading: 'Nalozi',
    icon: 'IconFileDescription',
    pluralNoun: 'naloga',
    mapItems: ({ shipments }) =>
      (shipments?.items ?? []).map((s) => ({
        id: s.id,
        href: `/dashboard/shipments/${s.id}`,
        title: s.orderNumber,
        subtitle: joinDefined(s.clientName ?? s.transportContractorName, s.externalOrderReference),
      })),
  },
  {
    key: 'fleet',
    type: SearchTypeEnum.FLEET,
    heading: 'Flota',
    icon: 'IconTruck',
    pluralNoun: 'vozila',
    mapItems: ({ fleet }) =>
      (fleet?.items ?? []).map((v) => ({
        id: v.id,
        href: `/dashboard/fleet/${fleetPathMap[v.fleetType]}/${v.id}`,
        title: v.registration,
        subtitle: joinDefined(fleetTypeLabelMap[v.fleetType], v.brand),
      })),
  },
  {
    key: 'employees',
    type: SearchTypeEnum.EMPLOYEES,
    heading: 'Zaposlenici',
    icon: 'IconUser',
    pluralNoun: 'zaposlenika',
    mapItems: ({ employees }) =>
      (employees?.items ?? []).map((e) => ({
        id: e.id,
        href: `/dashboard/employees/${e.id}`,
        title: `${e.firstName} ${e.lastName}`,
        subtitle: joinDefined(e.email, e.phoneNumber?.value),
      })),
  },
  {
    key: 'clients',
    type: SearchTypeEnum.CLIENTS,
    heading: 'Klijenti',
    icon: 'IconBriefcase',
    pluralNoun: 'klijenata',
    mapItems: ({ clients }) =>
      (clients?.items ?? []).map((c) => ({
        id: c.id,
        href: `/dashboard/clients/${c.id}`,
        title: c.name,
        subtitle: joinDefined(c.vatNumber),
      })),
  },
  {
    key: 'contractors',
    type: SearchTypeEnum.CONTRACTORS,
    heading: 'Kontraktori',
    icon: 'IconLicense',
    pluralNoun: 'kontraktora',
    mapItems: ({ contractors }) =>
      (contractors?.items ?? []).map((c) => ({
        id: c.id,
        href: `/dashboard/contractors/${c.id}`,
        title: c.name,
        subtitle: joinDefined(c.vatNumber),
      })),
  },
];

export function isSearchCategoryKey(value: unknown): value is SearchCategoryKey {
  return SEARCH_CATEGORIES.some((category) => category.key === value);
}

export function getSearchCategoryTotal(results: GlobalSearchResults | undefined, key: SearchCategoryKey) {
  return results?.[key]?.total ?? 0;
}

export function getSearchPageHref(query: string, key?: SearchCategoryKey) {
  const params = new URLSearchParams({ query });
  if (key) params.set('type', key);
  return `${SEARCH_PAGE_PATH}?${params.toString()}`;
}

export function mapToSearchResultGroups(results: GlobalSearchResults, query: string): SearchResultGroup[] {
  return SEARCH_CATEGORIES.map(({ key, heading, icon, pluralNoun, mapItems }) => {
    const items = mapItems(results);
    const total = getSearchCategoryTotal(results, key);

    return {
      key,
      heading,
      icon,
      items,
      showAll:
        total > items.length
          ? { href: getSearchPageHref(query, key), label: `Prikaži svih ${total} ${pluralNoun}` }
          : undefined,
    };
  }).filter((group) => group.items.length > 0);
}
