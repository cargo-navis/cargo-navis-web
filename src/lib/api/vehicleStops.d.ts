export interface VehicleStopAddress {
  id: string;
  streetName: string | null;
  postalCode: string;
  countryCode: string | null;
  placeName: string | null;
}

export interface VehicleStopAddressRequest {
  streetName: string;
  postalCodeId: string;
}

export interface VehicleStopCargoShipment {
  id: string;
  orderNumber: string;
  clientId: string | null;
}

export interface VehicleStopCargo {
  id: string;
  shipment: VehicleStopCargoShipment;
  weight: number;
  ldm: number;
  description: string | null;
  metadata: VehicleStopCargoMetadata;
  position: number;
  loadingAddress: VehicleStopAddress | null;
  loadingCompanyName: string | null;
  loadingReadyDate: string | null;
  loadingDescription: string | null;
  loadingReference: string | null;
  unloadingAddress: VehicleStopAddress | null;
  unloadingCompanyName: string | null;
  unloadingDueDate: string | null;
  unloadingDescription: string | null;
  unloadingReference: string | null;
}

export interface VehicleStopCargoMetadata {
  type: string;
  palleteType: string;
  palleteAmount: number;
  width: number;
  height: number;
  length: number;
}

export interface VehicleStopDocument {
  id: string;
  createdAt: string;
  name: string;
  mimeType: string;
  status: string;
  publicUrl: string | null;
}

export interface VehicleStop {
  id: string;
  createdAt: string;
  vehicleId: string;
  previousStopId: string | null;
  address: VehicleStopAddress | null;
  date: string | null;
  driverId: string | null;
  trailerId: string | null;
  disponentId: string | null;
  loadingCargos: VehicleStopCargo[];
  unloadingCargos: VehicleStopCargo[];
  documents: VehicleStopDocument[];
  messageSentAt: string | null;
  completedAt?: string;
}

export interface VehicleStopGroup {
  vehicleId: string;
  stops: VehicleStop[];
}

export type GetVehicleStopsParams = {
  vehicleId: string;
  page?: number;
  size?: number;
  sort?: string;
};

export interface CreateVehicleStopParams {
  vehicleId: string;
  previousStopId?: string | null;
  address?: VehicleStopAddressRequest | null;
  date?: string | null;
  driverId?: string | null;
  trailerId?: string | null;
  disponentId?: string | null;
  loadingCargoIds?: string[];
  unloadingCargoIds?: string[];
  sendMessage?: boolean;
}

export type UpdateVehicleStopParams = Partial<Omit<CreateVehicleStopParams, 'sendMessage'>>;
