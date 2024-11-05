import { number, object, string } from 'yup';

export const vehicleSchema = object({
  brand: string().required('Brand is required'),
  manufacturingYear: number().required('Manufacturing year is required'),
  registration: string().required('Registration is required'),
  registrationDate: string().required('Registration Date is required'),
  registrationExpiryDate: string().required('Registration Expiry Date is required'),
  emptyWeight: number().required('Curb weight is required'),
  numberOfAxles: number().required('Number of axels is required'),
  enginePower: number().required('Engine power is required'),
  tankSize: number().required('Tank size is required'),
  averageFuelConsumption: number().required('Average fuel consumption is required'),
  tachographExpiryDate: string().required('Tachograph Expiry Date is required'),
  fireExtinguisherCheckExpiryDate: string().required('Fire Extinguisher Expiry Date is required'),
  technicalInspectionExpiryDate: string().required('Technical inspection Expiry Date is required'),
  adrExpiryDate: string().required('ADR Expiry Date is required'),
}).required();
