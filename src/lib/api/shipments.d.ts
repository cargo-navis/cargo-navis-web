import type { ClientAddress } from '@/lib/api/clients.d';

export interface Shipment {
  id: string;
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

export type CreateShipmentData = Omit<Shipment, 'id'>;

// TODO - this should be for Create shipment
export interface LoadingAddress extends Partial<ClientAddress> {
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
  width: number;
  height: number;
  length: number;
}
