export interface ShipmentFields {
  cargoReference?: string;
  dispatcherId: string;
  clientId: string;
  isAgencyUse?: boolean;
  transportContractorId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  trailerId?: string | null;
  price?: number;
  cargo: Cargo[];
  sentToDriver?: boolean;
}

export interface Cargo {
  id?: string;
  weight: number;
  description?: string;
  ldm: number;
  metadata: CargoMetadata;
  loadingAddress: Address;
  loadingCompanyName?: string;
  loadingReadyDate?: string;
  loadingDate: string;
  loadingDescription?: string;
  unloadingAddress: Address;
  unloadingCompanyName?: string;
  unloadingDate: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
}

export type CargoType = 'standard' | 'nonstandard';

export interface CargoMetadata {
  type: CargoType;
  width?: number;
  height?: number;
  length?: number;
  palleteType?: PalleteType;
  palleteAmount?: number;
  hasKolete?: boolean;
}

interface Address {
  streetName: string;
  countryCode?: string;
  postalCodeId: {
    label?: string;
    value?: string;
  };
}
