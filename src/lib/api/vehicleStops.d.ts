export interface VehicleStopAddress {
  streetName: string;
  postalCode: string;
  city: string;
}

export interface VehicleStop {
  id: string;
  createdAt: string;
  vehicleId: string;
  previousStopId: string | null;
  address: VehicleStopAddress;
  date?: string;
  driverId: string;
  trailerId: string | null;
  disponentId: string;
  loadingCargos: unknown[];
  unloadingCargos: unknown[];
  documents: unknown[];
  messageSentAt: string | null;
}

export interface VehicleStopGroup {
  vehicleId: string;
  stops: VehicleStop[];
}
