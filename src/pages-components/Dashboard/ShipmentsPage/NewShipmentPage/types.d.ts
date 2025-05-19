export interface Address {
  streetName: string;
  postalCodeId: {
    label?: string;
    value?: string;
  };
  countryCode?: string;
}

export interface ShipmentFields {
  cargoReference?: string;
  dispatcherId: string;
  clientId: string;
  isAgencyUse?: boolean;
  transportContractorId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  trailerId?: string | null;
  loadingAddress?: {
    streetName: string;
    postalCodeId: {
      label?: string;
      value?: string;
    };
    countryCode?: string;
  };
  unloadingAddress?: {
    streetName: string;
    postalCodeId: {
      label?: string;
      value?: string;
    };
    countryCode?: string;
  };
  loadingCompanyName?: string;
  unloadingCompanyName?: string;
  loadingReadyDate?: string;
  loadingDate: string;
  loadingDescription?: string;
  unloadingDate: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  price?: number;
  orderNumber: string;
  cargo: Cargo[];
}

export interface Cargo {
  weight: number;
  description?: string;
  ldm: number;
  metadata: CargoMetadata;
}

export type CargoType = 'standard' | 'nonstandard';

export interface CargoMetadata {
  type: CargoType;
  width?: number;
  height?: number;
  length?: number;
  palleteType?: PalleteType;
  palleteAmount?: number;
}
