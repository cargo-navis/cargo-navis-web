export interface Shipment {
  id: string;
  cargoReference: string;
  orderNumber: string;
  dispatcherId?: string;
  driverId?: string;
  vehicleId?: string;
  trailerId?: string;
  clientId?: string;
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
  parentShipmentId: string;
  createdAt: string;
}

export interface CreateShipmentData extends Omit<Shipment, 'id' | 'loadingAddress' | 'unloadingAddress'> {
  loadingAddress: {
    name: string;
    postalCodeId: string;
  };
  unloadingAddress: {
    name: string;
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
