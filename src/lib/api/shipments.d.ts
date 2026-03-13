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
  invoiceStatusUpdatedAt: string | null;
  transportContractorId?: string;
  price: number;
  cargo: Cargo[];
  parentShipmentId?: string;
  subshipments?: Shipment[];
  createdAt: string;
  childShipments?: Shipment[];
  sentToDriver?: boolean;
  documents?: {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    status: string;
  }[];
}

export type GetShipmentParams = {
  clientId?: string;
  driverId?: string;
  dispatcherId?: string;
  loadStatus?: LoadStatus;
  invoiceStatus?: InvoiceStatus;
  loadingDateFrom?: string;
  loadingDateTo?: string;
  unloadingDateFrom?: string;
  unloadingDateTo?: string;
  // Pagination parameters
  page?: number;
  size?: number;
  // Sort parameters
  sort?: string;
};

export interface CreateShipmentData extends Omit<Shipment, 'id' | 'cargo'> {
  cargo: {
    weight: number;
    description?: string;
    ldm: number;
    metadata: Metadata;
    loadingAddress: {
      streetName: string;
      postalCodeId: string;
    };
    loadingCompanyName?: string;
    loadingReadyDate?: string;
    loadingDate: string;
    loadingDescription?: string;
    unloadingAddress: {
      streetName: string;
      postalCodeId: string;
    };
    unloadingCompanyName?: string;
    unloadingDate: string;
    unloadingDueDate?: string;
    unloadingDescription?: string;
  }[];
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
  id: string;
  weight: number;
  description: string;
  ldm: number;
  metadata: Metadata;
  loadingAddress: LoadingAddress;
  loadingCompanyName?: string;
  loadingReadyDate?: string;
  loadingDate: string;
  loadingReference?: string;
  loadingDescription?: string;
  unloadingAddress: LoadingAddress;
  unloadingCompanyName?: string;
  unloadingDate: string;
  unloadingDueDate?: string;
  unloadingReference?: string;
  unloadingDescription?: string;
  loadStatus?: LoadStatus;
}

export interface Metadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}
