import type { IconType } from '@/ui';

/**
 * One icon per concept (decided 2026-11-23, lab /entity-icons). Use these instead of naming the icon, so a klijent and
 * a podvozar never share one again.
 * - client: klijent (sidebar, ⌘K, Nalog header).
 * - contractor: podvozar — also the „Agencijski” badge (an agency nalog = a podvozar drives it).
 * - company: our own company (Postavke › Tvrtka, its warnings).
 * Fixed elsewhere: Flota IconTruck, Prijevozi IconTruckDelivery, documents / licences IconLicense.
 */
export const ENTITY_ICON = {
  client: 'IconBriefcase',
  contractor: 'IconTruckLoading',
  agency: 'IconTruckLoading',
  company: 'IconBuilding',
} as const satisfies Record<string, IconType>;
