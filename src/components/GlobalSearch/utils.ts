import { type GlobalSearchResults, type SearchShipmentCargo, SearchTypeEnum, VehicleEnum } from '@/lib/api';
import type { IconType, PillVariant } from '@/ui';

export type SearchCategoryKey = keyof GlobalSearchResults;

export interface SearchResultItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  // Labelled line below the subtitle, e.g. "Prijevoznik: …" for agency shipments
  detail?: {
    label: string;
    value: string;
  };
  // Rendered next to the title, e.g. "Agencijski nalog" for agency shipments
  titlePill?: {
    text: string;
    variant: PillVariant;
  };
  // Summary in a right-hand column beside the result (search modal and search page).
  // E.g. a shipment's cargo: primary "Transformer components +1", secondaryLead "14 paleta", secondary "2.771 kg"
  aside?: {
    primary?: string;
    // Full text behind `primary`, which the side column cuts off; one entry per line, e.g. every cargo's description
    primaryTooltip?: string[];
    // Start of the second line, emphasised
    secondaryLead?: string;
    secondary?: string;
  };
  // Set only when the matched field isn't already visible in the title or subtitle
  matchedValue?: string;
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

function withMatchedValue(item: Omit<SearchResultItem, 'matchedValue'>, matchedValue: string | undefined) {
  const isVisible =
    !matchedValue ||
    item.title.includes(matchedValue) ||
    !!item.subtitle?.includes(matchedValue) ||
    !!item.detail?.value.includes(matchedValue) ||
    !!item.aside?.primary?.includes(matchedValue);

  return isVisible ? item : { ...item, matchedValue };
}

function joinDefined(...parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(' • ') || undefined;
}

const formatNumber = (value: number) => value.toLocaleString('hr-HR', { maximumFractionDigits: 2 });

// 1, 21… paleta; 2–4, 22–24… palete; everything else paleta
function getPalletsNoun(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? 'palete' : 'paleta';
}

// Null when no cargo has the value, so it is left out instead of shown as 0
function sumDefined(values: (number | null)[]) {
  const defined = values.filter((value): value is number => value != null);
  return defined.length > 0 ? defined.reduce((total, value) => total + value, 0) : null;
}

// Length × width × height in metres, like cargo labels elsewhere (getCargoLabelParts); missing sides are skipped
function formatDimensions(dimensions: SearchShipmentCargo['dimensions']) {
  if (!dimensions) return null;
  const { length, width, height } = dimensions;
  const sides = [length, width, height].filter((side): side is number => side != null);
  return sides.length > 0 ? `${sides.map(formatNumber).join(' × ')} m` : null;
}

/**
 * Two lines about the shipment's cargo, to recognise it in search results. The first names the first described cargo
 * ("+N" for the other cargos): its description, or its dimensions when it has none. The second leads with how much is
 * carried, the pallet count or that cargo's dimensions when the first line already shows its description
 * (dimensions can't be added up), followed by the total weight.
 */
export function getCargoSummary(cargos: SearchShipmentCargo[]): SearchResultItem['aside'] {
  const leadCargo = cargos.find((cargo) => cargo.description?.trim() || formatDimensions(cargo.dimensions));
  const description = leadCargo?.description?.trim() || null;
  const dimensions = leadCargo ? formatDimensions(leadCargo.dimensions) : null;
  const otherCount = cargos.length - 1;

  const pallets = sumDefined(cargos.map((cargo) => cargo.palleteAmount));
  const weight = sumDefined(cargos.map((cargo) => cargo.weight));

  const lead = description ?? dimensions;
  const primary = lead && otherCount > 0 ? `${lead} +${otherCount}` : (lead ?? undefined);
  const palletsText = pallets ? `${formatNumber(pallets)} ${getPalletsNoun(pallets)}` : undefined;
  const secondaryLead = description && dimensions ? dimensions : palletsText;
  const secondary = weight ? `${formatNumber(weight)} kg` : undefined;

  // Every description, since the first line shows only the first one and cuts it off
  const descriptions = cargos.map((cargo) => cargo.description?.trim()).filter((text): text is string => !!text);
  const primaryTooltip = description ? descriptions : undefined;

  return primary || secondaryLead || secondary ? { primary, primaryTooltip, secondaryLead, secondary } : undefined;
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    key: 'shipments',
    type: SearchTypeEnum.SHIPMENTS,
    heading: 'Nalozi',
    icon: 'IconFileDescription',
    pluralNoun: 'naloga',
    mapItems: ({ shipments }) =>
      (shipments?.items ?? []).map((s) => {
        // For agency shipments the contractor is the one handling it, so it gets its own line
        const agencyContractorName = s.isAgency ? s.transportContractorName : null;

        return withMatchedValue(
          {
            id: s.id,
            href: `/dashboard/shipments/${s.id}`,
            title: s.orderNumber,
            titlePill: s.isAgency ? { text: 'Agencijski nalog', variant: 'warning' } : undefined,
            subtitle: joinDefined(
              agencyContractorName ? s.clientName : (s.clientName ?? s.transportContractorName),
              s.externalOrderReference
            ),
            detail: agencyContractorName ? { label: 'Prijevoznik', value: agencyContractorName } : undefined,
            aside: getCargoSummary(s.cargos ?? []),
          },
          s.matchedValue
        );
      }),
  },
  {
    key: 'fleet',
    type: SearchTypeEnum.FLEET,
    heading: 'Flota',
    icon: 'IconTruck',
    pluralNoun: 'vozila',
    mapItems: ({ fleet }) =>
      (fleet?.items ?? []).map((v) =>
        withMatchedValue(
          {
            id: v.id,
            href: `/dashboard/fleet/${fleetPathMap[v.fleetType]}/${v.id}`,
            title: v.registration,
            subtitle: joinDefined(fleetTypeLabelMap[v.fleetType], v.brand),
          },
          v.matchedValue
        )
      ),
  },
  {
    key: 'employees',
    type: SearchTypeEnum.EMPLOYEES,
    heading: 'Zaposlenici',
    icon: 'IconUser',
    pluralNoun: 'zaposlenika',
    mapItems: ({ employees }) =>
      (employees?.items ?? []).map((e) =>
        withMatchedValue(
          {
            id: e.id,
            href: `/dashboard/employees/${e.id}`,
            title: `${e.firstName} ${e.lastName}`,
            subtitle: joinDefined(e.email, e.phoneNumber?.value),
          },
          e.matchedValue
        )
      ),
  },
  {
    key: 'clients',
    type: SearchTypeEnum.CLIENTS,
    heading: 'Klijenti',
    icon: 'IconBriefcase',
    pluralNoun: 'klijenata',
    mapItems: ({ clients }) =>
      (clients?.items ?? []).map((c) =>
        withMatchedValue(
          {
            id: c.id,
            href: `/dashboard/clients/${c.id}`,
            title: c.name,
            subtitle: joinDefined(c.vatNumber),
          },
          c.matchedValue
        )
      ),
  },
  {
    key: 'contractors',
    type: SearchTypeEnum.CONTRACTORS,
    heading: 'Kontraktori',
    icon: 'IconLicense',
    pluralNoun: 'kontraktora',
    mapItems: ({ contractors }) =>
      (contractors?.items ?? []).map((c) =>
        withMatchedValue(
          {
            id: c.id,
            href: `/dashboard/contractors/${c.id}`,
            title: c.name,
            subtitle: joinDefined(c.vatNumber),
          },
          c.matchedValue
        )
      ),
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
