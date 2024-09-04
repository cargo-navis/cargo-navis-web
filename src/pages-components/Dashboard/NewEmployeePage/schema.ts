import { object, string, array, Schema } from 'yup';
import { PositionEnum } from '@/lib/api/employees.d';

export const employeeSchema = object({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  position: string<PositionEnum>().required('Position is required'),
  email: string().email('Email must be valid').required('Email is required'),
  phoneNumber: string(),
  governmentId: requiredWhenDriver(string()),
  driverLicenceCategories: requiredWhenDriver(array(string())),
  adr: requiredWhenDriver(string()),
  driverLicenceExpiryDate: requiredWhenDriver(string()),
  licenceCountry: requiredWhenDriver(string()),
  employmentExpirationDate: requiredWhenDriver(string()),
  medicalExpirationDate: requiredWhenDriver(string()),
  visaExpirationDate: requiredWhenDriver(string()),
}).required();

function requiredWhenDriver(schema: Schema) {
  return schema.when('position', {
    is: PositionEnum.Driver,
    then: (s) => s.optional(),
  });
}