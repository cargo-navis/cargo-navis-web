import { type EquipmentEnum, VehicleEnum, type VehicleLoadEnum } from './vehicles';

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

export type CreateVehicleParams = Partial<Vehicle>;

export type UpdateVehicleParams = Partial<CreateVehicleParams>;
