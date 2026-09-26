import type { VehicleEnum } from './vehicles';

export interface GlobalSearchParams {
  q: string;
  limit?: number;
}

export interface SearchShipment {
  id: string;
  orderNumber: string;
  externalOrderReference: string | null;
  clientName: string | null;
  transportContractorName: string | null;
}

export interface SearchFleetItem {
  id: string;
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

export interface SearchEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: SearchPhoneNumber | null;
}

export interface SearchClient {
  id: string;
  name: string;
  vatNumber: string | null;
}

export interface SearchContractor {
  id: string;
  name: string;
  vatNumber: string | null;
}

export interface GlobalSearchResults {
  shipments: SearchShipment[];
  fleet: SearchFleetItem[];
  employees: SearchEmployee[];
  clients: SearchClient[];
  contractors: SearchContractor[];
}
