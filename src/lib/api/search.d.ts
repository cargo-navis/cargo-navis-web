import type { SearchTypeEnum } from './search';
import type { VehicleEnum } from './vehicles';

export interface GlobalSearchParams {
  q: string;
  // Results per type, backend default 5 (max 20)
  limit?: number;
  // 0-based, backend default 0
  page?: number;
  // Backend searches all types when omitted
  types?: SearchTypeEnum[];
}

interface SearchResultBase {
  id: string;
  // Whole value of the field that matched the query (e.g. client name, VAT number, email)
  matchedValue: string;
}

export interface SearchShipment extends SearchResultBase {
  orderNumber: string;
  externalOrderReference: string | null;
  clientName: string | null;
  transportContractorName: string | null;
  isAgency: boolean;
}

export interface SearchFleetItem extends SearchResultBase {
  registration: string;
  brand: string;
  fleetType: VehicleEnum;
}

export interface SearchPhoneNumber {
  value: string;
  countryCode: string;
  nationalNumber: string;
  countryName: string;
}

export interface SearchEmployee extends SearchResultBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: SearchPhoneNumber | null;
}

export interface SearchClient extends SearchResultBase {
  name: string;
  vatNumber: string | null;
}

export interface SearchContractor extends SearchResultBase {
  name: string;
  vatNumber: string | null;
}

export interface SearchResultPage<T> {
  items: T[];
  // Total matches for the category, independent of limit
  total: number;
}

export interface GlobalSearchResults {
  shipments: SearchResultPage<SearchShipment>;
  fleet: SearchResultPage<SearchFleetItem>;
  employees: SearchResultPage<SearchEmployee>;
  clients: SearchResultPage<SearchClient>;
  contractors: SearchResultPage<SearchContractor>;
}
