import type { VehicleStopAddress, VehicleStopCargo, VehicleStopDocument } from './vehicleStops.d';

export interface DriverCargoShipment {
  id: string;
  orderNumber: string;
}

export interface DriverStopCargo extends Omit<VehicleStopCargo, 'shipment' | 'weight' | 'ldm'> {
  shipment: DriverCargoShipment;
  // Cargo forms treat these as optional, so the API can return null.
  weight: number | null;
  ldm: number | null;
}

export interface DriverStopDocument extends VehicleStopDocument {
  uploadedBy: string | null;
}

export interface DriverStop {
  id: string;
  address: VehicleStopAddress | null;
  /** Date-only, 'YYYY-MM-DD'. */
  date: string | null;
  completedAt: string | null;
  loadingCargos: DriverStopCargo[];
  unloadingCargos: DriverStopCargo[];
  documents: DriverStopDocument[];
}

/** Derived on the frontend by `buildDriverShipments`, not returned by the API. */
export interface DriverShipment {
  id: string;
  orderNumber: string;
  origin: VehicleStopAddress | null;
  destination: VehicleStopAddress | null;
  completedStopsCount: number;
  totalStopsCount: number;
  /** Stops of this shipment in route order, with cargos filtered to this shipment. */
  stops: DriverStop[];
}

export interface DriverTokenExchangeResponse {
  accessToken: string;
}
