import { InvoiceStatus, LoadStatus } from './shipments';

export interface Shipment {
  id: string;
  cargoReference: string;
  externalOrderReference?: string;
  orderNumber: string;
  createdById: string;
  clientId?: string;
  invoiceStatus: InvoiceStatus;
  invoiceStatusUpdatedAt: string | null;
  isInvoiceOverdue: boolean | null; // todo - [added]
  transportContractorId?: string;
  price: number;
  cargo: Cargo[];
  createdAt: string;
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
  isInvoiceOverdue?: string;
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
    loadingDescription?: string;
    unloadingAddress: {
      streetName: string;
      postalCodeId: string;
    };
    unloadingCompanyName?: string;
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
  loadingReference?: string;
  loadingDescription?: string;
  unloadingAddress: LoadingAddress;
  unloadingCompanyName?: string;
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
