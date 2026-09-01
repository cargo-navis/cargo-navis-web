import { InvoiceStatus, LoadStatus } from './shipments';
import type { VehicleStop, VehicleStopCargoShipment } from './vehicleStops.d';

/**
 * Agency-specific fields. The backend returns these on every ShipmentResponse:
 * populated for agency shipments (parent), `null` for regular ones.
 *
 * On an agency shipment `transportContractorId` is the external carrier (the
 * child's contractor), not the tenant.
 */
export interface AgencyShipmentFields {
  isAgency: boolean;
  /** ID of the outgoing (child) shipment. Never fetched directly. */
  childId: string | null;
  contractorOrderNumber: string | null;
  contractorExternalOrderReference: string | null;
  /** Price towards the carrier (child). */
  contractorPrice: number | null;
  /** Invoice status towards the carrier (child). */
  contractorInvoiceStatus: InvoiceStatus | null;
}

export interface Shipment extends AgencyShipmentFields {
  id: string;
  externalOrderReference?: string;
  orderNumber: string;
  createdById: string;
  clientId?: string;
  invoiceStatus: InvoiceStatus;
  invoiceStatusUpdatedAt: string | null;
  isInvoiceOverdue: boolean | null; // todo - [added]
  transportContractorId?: string;
  price: number;
  internalNote?: string;
  externalNote?: string;
  cargo: Cargo[];
  createdAt: string;
  documents?: {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    status: string;
  }[];
  vehicleStops?: VehicleStop[];
  children?: Shipment[];
}

export type GetShipmentParams = {
  clientId?: string;
  driverId?: string;
  dispatcherId?: string;
  loadStatus?: LoadStatus;
  invoiceStatus?: InvoiceStatus;
  isInvoiceOverdue?: string;
  loadingReadyDateFrom?: string;
  loadingReadyDateTo?: string;
  unloadingDueDateFrom?: string;
  unloadingDueDateTo?: string;
  isActive?: boolean;
  /** Unset returns all shipments; true only agency, false only regular. */
  isAgency?: boolean;
  // Pagination parameters
  page?: number;
  size?: number;
  // Sort parameters
  sort?: string;
};

export interface CargoAddressData {
  streetName: string;
  postalCodeId: string;
}

/**
 * Cargo as sent to the backend, on both the regular and the agency endpoints.
 *
 * Differs from the returned {@link Cargo}: addresses carry a `postalCodeId`
 * instead of a resolved {@link LoadingAddress}, and `id` is present only when
 * updating an existing item. Addresses are optional because a shipment can be
 * created before its stops are known.
 */
export interface ShipmentCargoData {
  /** Present only when updating an existing cargo item. */
  id?: string;
  weight: number;
  description?: string;
  ldm: number;
  metadata: Metadata;
  loadingAddress?: CargoAddressData;
  loadingCompanyName?: string;
  loadingReadyDate?: string;
  loadingDescription?: string;
  loadingReference?: string;
  unloadingAddress?: CargoAddressData;
  unloadingCompanyName?: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  unloadingReference?: string;
}

export interface CreateShipmentData extends Omit<Shipment, 'id' | 'cargo' | keyof AgencyShipmentFields> {
  cargo: ShipmentCargoData[];
  children?: CreateShipmentData[];
  draftId?: string;
}

// TODO - this should be for Create shipment
export interface LoadingAddress {
  streetName: string;
  postalCodeId: string;
  postalCode: string;
  countryCode: string;
  placeName: string;
}

export interface Cargo {
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

export interface AvailableCargo extends Cargo {
  shipment?: VehicleStopCargoShipment;
}

export interface AvailableCargosResponse {
  loadingCargos: AvailableCargo[];
  unloadingCargos: AvailableCargo[];
}

export interface Metadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}
