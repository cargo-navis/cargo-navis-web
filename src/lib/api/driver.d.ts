import type { VehicleStopAddress, VehicleStopCargo, VehicleStopDocument } from './vehicleStops.d';

export interface DriverCargoShipment {
  id: string;
  orderNumber: string;
}

/** Same values as `LoadStatus` in shipments.ts, kept as a type so the driver bundle doesn't import that module. */
export type DriverCargoLoadStatus = 'not_yet_loaded' | 'loaded' | 'unloaded';

export interface DriverStopCargo extends Omit<VehicleStopCargo, 'shipment' | 'weight' | 'ldm'> {
  shipment: DriverCargoShipment;
  /** The backend only confirms an unloading stop when its cargo is `loaded`. */
  loadStatus: DriverCargoLoadStatus | null;
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
  /** The dispatcher in charge of the stop, so the driver knows whom to contact. */
  disponent: DriverStopDisponent | null;
}

export interface DriverStopDisponent {
  firstName: string | null;
  lastName: string | null;
  /** E.164, e.g. '+385915632655'. */
  phoneNumber: string | null;
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
