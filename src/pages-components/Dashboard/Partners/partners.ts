import { type Crumb, CRUMBS } from '@/components/layout/DashboardLayout';
import type { Client, Contractor, PostalCode } from '@/lib/api';
import type { PluralForms } from '@/lib/utils/plural';
import type { IconType } from '@/ui';

/**
 * Klijenti + Kontraktori share one design (lab /partners): today the two are copies of each other, contractors only
 * differ in a required Valuta plaćanja and a plain email (clients have KAN-112 notification contacts instead).
 */
export type PartnerKind = 'client' | 'contractor';

/** One shape for both, mapped from today's Client / Contractor (src/lib/api/clients.d.ts, contractors.d.ts). */
export interface Partner {
  id: string;
  name: string;
  taxId: string;
  /** Days; null when not set (today's API stores 0 / '' for „none”). */
  termsOfPayment: number | null;
  street: string;
  postalCode: PostalCode | null;
  countryCode: string;
  /** Client: its notification contacts (first = the one shown in the list). Contractor: its email. */
  emails: string[];
}

function toTerms(value: string | number | null | undefined) {
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? days : null;
}

function toPostalCode(address: Client['address']): PostalCode | null {
  return address.postalCodeId
    ? {
        id: address.postalCodeId,
        postalCode: address.postalCode ?? '',
        placeName: address.placeName ?? '',
        countryCode: address.countryCode ?? '',
      }
    : null;
}

export function fromClient(client: Client): Partner {
  return {
    id: String(client.id),
    name: client.name,
    taxId: client.taxId ?? '',
    termsOfPayment: toTerms(client.termsOfPayment),
    street: client.address?.streetName ?? '',
    postalCode: client.address ? toPostalCode(client.address) : null,
    countryCode: client.address?.countryCode ?? '',
    emails: (client.notificationEmails ?? []).map((contact) => contact.email),
  };
}

export function fromContractor(contractor: Contractor): Partner {
  return {
    id: String(contractor.id),
    name: contractor.name,
    taxId: contractor.taxId ?? '',
    termsOfPayment: toTerms(contractor.termsOfPayment),
    street: contractor.address?.streetName ?? '',
    postalCode: contractor.address ? toPostalCode(contractor.address) : null,
    countryCode: contractor.address?.countryCode ?? '',
    emails: contractor.email ? [contractor.email] : [],
  };
}

export const toClientPartners = (clients: Client[]) => clients.map(fromClient);
export const toContractorPartners = (contractors: Contractor[]) => contractors.map(fromContractor);

interface PartnerWords {
  one: string;
  many: string;
  /** Accusative („Izbrisati klijenta …?”, „Uredi klijenta”). */
  accusative: string;
  count: PluralForms;
  add: string;
  newTitle: string;
  editTitle: string;
  icon: IconType;
  search: string;
  newOrder: string;
  emptyTitle: string;
  notFound: string;
  basePath: string;
  crumb: Crumb;
}

export const PARTNER_WORDS: Record<PartnerKind, PartnerWords> = {
  client: {
    one: 'Klijent',
    many: 'Klijenti',
    accusative: 'klijenta',
    count: ['klijent', 'klijenta', 'klijenata'],
    add: 'Dodaj klijenta',
    newTitle: 'Novi klijent',
    editTitle: 'Uredi klijenta',
    icon: 'IconBriefcase',
    search: 'Pretraži klijente…',
    newOrder: 'Novi nalog',
    emptyTitle: 'Još nema klijenata',
    notFound: 'Klijent nije pronađen',
    basePath: '/dashboard/clients',
    crumb: CRUMBS.clients,
  },
  contractor: {
    one: 'Kontraktor',
    many: 'Kontraktori',
    accusative: 'kontraktora',
    count: ['kontraktor', 'kontraktora', 'kontraktora'],
    add: 'Dodaj kontraktora',
    newTitle: 'Novi kontraktor',
    editTitle: 'Uredi kontraktora',
    icon: 'IconLicense',
    search: 'Pretraži kontraktore…',
    newOrder: 'Novi agencijski nalog',
    emptyTitle: 'Još nema kontraktora',
    notFound: 'Kontraktor nije pronađen',
    basePath: '/dashboard/contractors',
    crumb: CRUMBS.contractors,
  },
};

export const partnerHref = (kind: PartnerKind, id: string) => `${PARTNER_WORDS[kind].basePath}/${id}`;
export const partnerEditHref = (kind: PartnerKind, id: string) => `${partnerHref(kind, id)}/edit`;

/**
 * „Novi nalog” with this partner filled in (client: the nalog's client; contractor: an agency nalog with them as the
 * carrier). The Nalog form (PR 4) reads these params; until then the form opens empty.
 */
export const partnerNewOrderHref = (kind: PartnerKind, id: string) =>
  kind === 'client'
    ? `/dashboard/shipments/new?clientId=${encodeURIComponent(id)}`
    : `/dashboard/shipments/new?contractorId=${encodeURIComponent(id)}`;

/** Search over name / place / tax id / email (DECISIONS §5), case- and diacritic-insensitive. */
export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
}

export function partnerSearchText(partner: Partner) {
  return normalizeSearch(
    [partner.name, partner.postalCode?.placeName, partner.postalCode?.postalCode, partner.taxId, ...partner.emails]
      .filter(Boolean)
      .join(' ')
  );
}
