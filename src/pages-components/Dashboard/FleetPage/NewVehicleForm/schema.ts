import { VehicleEnum } from '@/lib/api';
import { type ObjectSchema, array, boolean, number, object, string } from 'yup';

export const vehicleSchema = object({
  brand: string().optional(),
  manufacturingYear: number().optional(),
  registration: string().optional(),
  registrationDate: string().optional(),
  registrationExpiryDate: string().optional(),
  emptyWeight: number().optional(),
  numberOfAxles: number().optional(),
  periodicalTechnicalInspectionExpiryDate: string().optional(),
  smallServiceExpiryDate: string().optional(),
  bigServiceExpiryDate: string().optional(),
  tiresReplacementExpiryDate: string().optional(),
  mandatoryInsuranceExpiryDate: string().optional(),
  optionalInsuranceExpiryDate: string().optional(),
  leasingExpiryDate: string().optional(),
}).required();

export const truckSchema = object({
  enginePower: number().optional(),
  tankSize: number().optional(),
  averageFuelConsumption: number().optional(),
  tachographExpiryDate: string().optional(),
  fireExtinguisherCheckExpiryDate: string().optional(),
  technicalInspectionExpiryDate: string().optional(),
  adrExpiryDate: string().optional(),
}).required();

export const trailerSchema = object({
  loadCapacity: number().optional(),
  width: number().optional(),
  height: number().optional(),
  length: number().optional(),
  codeXlCertificateExpiryDate: string().optional(),
  ramp: boolean().optional(),
  vehicleLoadType: string().optional(),
  equipment: array(string()),
}).required();

const typeSchemaMap: Record<VehicleEnum, ObjectSchema<any>> = {
  [VehicleEnum.TRUCK]: truckSchema,
  [VehicleEnum.TRAILER]: trailerSchema,
  [VehicleEnum.SOLO_TRUCK]: truckSchema.concat(trailerSchema),
  [VehicleEnum.VAN]: truckSchema.concat(trailerSchema),
};

export function getSchemaForType(type: VehicleEnum) {
  const schema = typeSchemaMap[type];
  return vehicleSchema.concat(schema);
}
