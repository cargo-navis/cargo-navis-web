import { object, string } from 'yup';

export const vehicleSchema = object({
  brand: string().required('Brand is required'),
  manufacturingYear: string().required('Manufacturing year is required'),
  registration: string().required('Registration is required'),
  registrationDate: string().required('Registration Date is required'),
  registrationExpiryDate: string().required('Registration Expiry Date is required'),
  emptyWeight: string().required('Curb weight is required'),
  numberOfAxles: string().required('Number of axels is required'),
  enginePower: string().required('Engine power is required'),
  tankSize: string().required('Tank size is required'),
  averageFuelConsumption: string().required('Average fuel consumption is required'),
  tachographExpiryDate: string().required('Tachograph Expiry Date is required'),
  fireExtinguisherCheckExpiryDate: string().required('Fire Extinguisher Expiry Date is required'),
  technicalInspectionExpiryDate: string().required('Technical inspection Expiry Date is required'),
  adrExpiryDate: string().required('ADR Expiry Date is required'),
}).required();
