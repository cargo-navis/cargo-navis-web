import { InvoiceStatus, LoadStatus } from './shipments';

export interface Shipment {
  id: string;
  cargoReference: string;
  orderNumber: string;
  createdById: string;
  // dispatcherId?: string; // Todo - [Refactor] Remove
  // driverId?: string | null; // Todo - [Refactor] Remove
  // vehicleId?: string | null; // Todo - [Refactor] Remove
  // trailerId?: string | null; // Todo - [Refactor] Remove
  clientId?: string;
  // isAgencyUse?: boolean; // Todo - [Refactor] Remove
  invoiceStatus: InvoiceStatus;
  invoiceStatusUpdatedAt: string | null;
  isInvoiceOverdue: boolean | null; // todo - [added]
  transportContractorId?: string;
  price: number;
  cargo: Cargo[];
  // parentShipmentId?: string; // Todo - [Refactor] Remove
  // subshipments?: Shipment[]; // Todo - [Refactor] Remove
  createdAt: string;
  // childShipments?: Shipment[]; // Todo - [Refactor] Remove
  // sentToDriver?: boolean; // Todo - [Refactor] Remove
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
    // loadingDate: string; // Todo - [Refactor] Remove
    loadingDescription?: string;
    unloadingAddress: {
      streetName: string;
      postalCodeId: string;
    };
    unloadingCompanyName?: string;
    // unloadingDate: string; // Todo - [Refactor] Remove
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
  // loadingDate: string; // TODO - [Refactor] Remove
  loadingReference?: string;
  loadingDescription?: string;
  unloadingAddress: LoadingAddress;
  unloadingCompanyName?: string;
  // unloadingDate: string; // TODO - [Refactor] Remove
  unloadingDueDate?: string;
  unloadingReference?: string;
  unloadingDescription?: string;
  loadStatus?: LoadStatus;
  // vehicleStops?: VehicleStop[]; // TODO - [Refactor] Add
}

export interface Metadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}
