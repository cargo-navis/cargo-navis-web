export interface Shipment {
  cargoReference: string;
  orderNumber: string;
  dispatcherId?: string;
  driverId?: string;
  vehicleId?: string;
  clientId?: string;
  transportContractorId?: string;
  price: number;
  cargo: Cargo[];
  loadingAddress: LoadingAddress;
  loadingReadyDate: string;
  loadingDate: string;
  loadingDescription: string;
  unloadingAddress: LoadingAddress;
  unloadingDate: string;
  unloadingDueDate: string;
  unloadingDescription: string;
  parentShipmentId: string;
}

export type CreateShipmentData = Shipment;

export interface LoadingAddress {
  name: string;
  postalCodeId: string;
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
}
