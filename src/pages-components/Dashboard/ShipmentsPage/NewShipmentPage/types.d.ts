interface PostalCode {
  label?: string;
  value?: string;
}

interface Address {
  name: string;
  postalCodeId: PostalCode;
  countryCode?: string;
}

export interface ShipmentFields {
  cargoReference?: string;
  dispatcherId?: string;
  clientId?: string;
  transportContractorId?: string;
  loadingAddress?: Address;
  unloadingAddress?: Address;
  loadingReadyDate?: string;
  loadingDate?: string;
  loadingDescription?: string;
  unloadingDate?: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  price?: number;
  orderNumber: string;
  cargo: Cargo[];
}

export interface Cargo {
  weight?: number;
  description?: string;
  metadata: CargoMetadata;
}

type CargoType = 'standard' | 'nonstandard';

export interface CargoMetadata {
  type: CargoType;
  width?: number;
  height?: number;
  length?: number;
  palleteType?: PalleteType;
  palleteAmount?: number;
}
