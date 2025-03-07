export interface CreateShipmentData {
  cargoReference: string;
  orderNumber: string;
  dispatcherId?: string;
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

export interface LoadingAddress {
  name: string;
  postalCodeId: string;
}

export interface Cargo {
  weight: number;
  description: string;
  metadata: Metadata;
}

export interface Metadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
}
