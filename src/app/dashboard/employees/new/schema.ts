import { object, string, array } from 'yup';
import { PositionEnum } from '@/lib/employees.d';

export const employeeSchema = object({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  position: string<PositionEnum>().required('Position is required'),
  email: string().email().required('Email is required'),
  phoneNumber: string(),
  governmentId: string(),
  driverLicenceCategories: array(string()),
  adr: string(),
  driverLicenceExpirationDate: string(),
  licenceCountry: string(),
  employmentExpirationDate: string(),
  medicalExpirationDate: string(),
  visaExpirationDate: string(),
});