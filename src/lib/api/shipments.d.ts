import { InvoiceStatus, LoadStatus } from './shipments';

export interface Shipment {
  id: string;
  cargoReference: string;
  orderNumber: string;
  dispatcherId?: string;
  driverId?: string | null;
  vehicleId?: string | null;
  trailerId?: string | null;
  clientId?: string;
  isAgencyUse?: boolean;
  invoiceStatus: InvoiceStatus;
  transportContractorId?: string;
  price: number;
  cargo: Cargo[];
  loadingAddress: LoadingAddress;
  loadingCompanyName?: string;
  loadingReadyDate: string;
  loadingDate: string;
  loadingDescription: string;
  unloadingAddress: LoadingAddress;
  unloadingCompanyName?: string;
  unloadingDate: string;
  unloadingDueDate: string;
  unloadingDescription: string;
  parentShipmentId?: string;
  subshipments?: Shipment[];
  createdAt: string;
  loadStatus?: LoadStatus;
}

export type GetShipmentParams = {
  clientId?: string;
  driverId?: string;
  loadStatus?: LoadStatus;
  invoiceStatus?: InvoiceStatus;
  loadingDateFrom?: string;
  loadingDateTo?: string;
  unloadingDateFrom?: string;
  unloadingDateTo?: string;
  // Pagination parameters
  page?: number;
  size?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
};

export interface CreateShipmentData extends Omit<Shipment, 'id' | 'loadingAddress' | 'unloadingAddress'> {
  loadingAddress: {
    streetName: string;
    postalCodeId: string;
  };
  unloadingAddress: {
    streetName: string;
    postalCodeId: string;
  };
}

// TODO - this should be for Create shipment
export interface LoadingAddress {
  streetName: string;
  id: string;
  postalCode: string;
  countryCode: string;
  placeName: string;
}

interface Cargo {
  weight: number;
  description: string;
  ldm: number;
  metadata: Metadata;
}

export interface Metadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}
