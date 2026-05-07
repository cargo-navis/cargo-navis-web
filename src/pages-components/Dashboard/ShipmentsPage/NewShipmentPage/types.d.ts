export interface ShipmentFields {
  externalOrderReference?: string;
  clientId: string;
  transportContractorId: string;
  price?: number;
  cargo: Cargo[];
}

export interface Cargo {
  id?: string;
  weight?: number;
  description?: string;
  ldm: number;
  metadata: CargoMetadata;
  loadingAddress: Address;
  loadingCompanyName?: string;
  loadingReadyDate?: string;
  loadingDescription?: string;
  loadingReference?: string;
  unloadingAddress: Address;
  unloadingCompanyName?: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  unloadingReference?: string;
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
