export enum VehicleEnum {
  TRUCK = 'TRUCK',
  TRAILER = 'TRAILER',
  SOLO = 'SOLO',
  VAN = 'VAN',
}

export interface Vehicle {
  id: string;
  type: VehicleEnum;
  emissionStandard: string;
  enginePower: number;
  tankSize: number;
  averageFuelConsumption: number;
  tachographExpiryDate: string;
  fireExtinguisherCheckExpiryDate: string;
  technicalInspectionDate: string;
  adrExpiryDate: string;
  dimensions: Dimensions;
  loadCapacity: number;
  vehicleLoadType: VehicleLoadEnum;
  equipment: string[];
  ramp: boolean;
  codeXlCertificateExpiryDate: string;
  brand: string;
  manufacturingYear: number;
  numberOfAxles: number;
  registration: string;
  registrationDate: string;
  registrationExpiryDate: string;
  emptyWeight: number;
}

export interface Dimensions {
  width: number;
  height: number;
  length: number;
  id: string;
}

export enum VehicleLoadEnum {
  FURGON = 'furgon',
  CISTERN = 'cistern',
  TILT_TRUCK = 'tilt_truck',
  FRIGO = 'frigo',
  CONTAINER_TRAILER = 'container_trailer',
}
