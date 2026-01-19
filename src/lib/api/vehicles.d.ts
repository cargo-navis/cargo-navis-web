import { VehicleEnum } from './vehicles';

export interface Vehicle {
  id: string;
  type: VehicleEnum;
  emissionStandard: string;
  enginePower: number;
  tankSize: number;
  averageFuelConsumption: number;
  tachographExpiryDate: string;
  fireExtinguisherCheckExpiryDate: string;
  technicalInspectionExpiryDate: string;
  periodicalTechnicalInspectionExpiryDate?: string;
  smallServiceExpiryDate?: string;
  bigServiceExpiryDate?: string;
  tiresReplacementExpiryDate?: string;
  mandatoryInsuranceExpiryDate?: string;
  optionalInsuranceExpiryDate?: string;
  leasingExpiryDate?: string;
  adrExpiryDate: string;
  dimensions: Dimensions;
  loadCapacity: number;
  vehicleLoadType: VehicleLoadEnum;
  equipment: EquipmentEnum[];
  ramp: boolean;
  codeXlCertificateExpiryDate: string;
  brand: string;
  manufacturingYear: number;
  numberOfAxles: number;
  registration: string;
  registrationDate: string;
  registrationExpiryDate: string;
  emptyWeight: number;
  vehicleIdentificationNumber: string;
  documents?: {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    status: string;
  }[];
}

export interface Dimensions {
  width: number;
  height: number;
  length: number;
  id: string;
}

export enum EmissionStandard {
  Euro1 = 'EURO1',
  Euro2 = 'EURO2',
  Euro3 = 'EURO3',
  Euro4 = 'EURO4',
  Euro5 = 'EURO5',
  Euro6 = 'EURO6',
  Euro7 = 'EURO7',
  Euro8 = 'EURO8',
}

export enum VehicleLoadEnum {
  FURGON = 'furgon',
  CISTERN = 'cistern',
  TILT_TRUCK = 'tilt_truck',
  FRIGO = 'frigo',
  CONTAINER_TRAILER = 'container_trailer',
}

export enum EquipmentEnum {
  EDGE_PROTECTION = 'edge_protection',
  LASHING_CHAINS = 'lashing_chains',
  ANTI_SLIP_MATS = 'anti_slip_mats',
  ADR = 'adr',
  LASHING_STRAPS = 'lashing_straps',
  STANCHIONS = 'stanchions',
  CUSTOM_SEAL_STRING = 'custom_seal_string',
  PORTABLE_FORKLIFT = 'portable_forklift',
  WASTE_CARRIER_LICENCE = 'waste_carrier_licence',
  MEAT_HOOK = 'meat_hooks',
  PALLETS = 'pallets',
}

export type CreateVehicleParams = Partial<Vehicle>;

export type UpdateVehicleParams = Partial<CreateVehicleParams>;
