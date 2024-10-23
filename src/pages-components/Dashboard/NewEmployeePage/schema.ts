import { PositionEnum } from '@/lib/api/employees.d';
import { type Schema, array, boolean, object, string } from 'yup';

export const employeeSchema = object({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  position: string<PositionEnum>().required('Position is required'),
  email: string().email('Email must be valid').required('Email is required'),
  phoneNumber: string(),
  governmentId: whenDriver(string()),
  driverLicenceCategories: whenDriver(array(string())),
  adr: whenDriver(boolean()),
  driverLicenceExpiryDate: whenDriver(string()),
  professionalDriverLicenceExpiryDate: whenDriver(string()),
  nationality: whenDriver(string()),
  contractExpiryDate: whenDriver(string()),
  medicalExaminationExpiryDate: whenDriver(string()),
  visaExpiryDate: whenDriver(string()),
}).required();

function whenDriver(schema: Schema) {
  return schema.when('position', {
    is: PositionEnum.Driver,
    then: (s) => s.optional().nullable(),
    otherwise: (s) => s.nullable(),
  });
}
