import { VehicleEnum } from '@/lib/api';
import { type ObjectSchema, array, boolean, number, object, string } from 'yup';

export const vehicleSchema = object({
  brand: string().required('Brand is required'),
  manufacturingYear: number().required('Manufacturing year is required'),
  registration: string().required('Registration is required'),
  registrationDate: string().required('Registration Date is required'),
  registrationExpiryDate: string().required('Registration Expiry Date is required'),
  emptyWeight: number().required('Curb weight is required'),
  numberOfAxles: number().required('Number of axels is required'),
  periodicalTechnicalInspectionExpiryDate: string().required(),
  smallServiceExpiryDate: string().required(),
  bigServiceExpiryDate: string().required(),
  tiresSeasonalReplacementExpiryDate: string().required(),
  insuranceExpiryDate: string().required(),
  leasingExpiryDate: string().required(),
}).required();

export const truckSchema = object({
  enginePower: number().required('Engine power is required'),
  tankSize: number().required('Tank size is required'),
  averageFuelConsumption: number().required('Average fuel consumption is required'),
  tachographExpiryDate: string().required('Tachograph Expiry Date is required'),
  fireExtinguisherCheckExpiryDate: string().required('Fire Extinguisher Expiry Date is required'),
  technicalInspectionExpiryDate: string().required('Technical inspection Expiry Date is required'),
  adrExpiryDate: string().required('ADR Expiry Date is required'),
}).required();

export const trailerSchema = object({
  loadCapacity: number().required('Load Capacity is required'),
  width: number().optional(),
  height: number().optional(),
  length: number().optional(),
  codeXlCertificateExpiryDate: string().optional(),
  ramp: boolean().optional(),
  vehicleLoadType: string().required('Vehicle Load type is required'),
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
