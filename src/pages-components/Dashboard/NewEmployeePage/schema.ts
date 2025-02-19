import { array, object, type Schema, string } from 'yup';

import { PositionEnum } from '@/lib/api/employees.d';

export const employeeSchema = object({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  position: string<PositionEnum>().required('Position is required'),
  email: string().email('Email must be valid').optional(),
  phoneNumber: string().optional(),
  governmentId: whenDriver(string()),
  governmentIdExpiryDate: whenDriver(string()),
  driverLicenceId: whenDriver(string()),
  driverLicenceExpiryDate: whenDriver(string()),
  driverLicenceCategories: whenDriver(array(string())),
  professionalDriverLicenceExpiryDate: whenDriver(string()),
  nationality: whenDriver(string()),
  driverTachographCardId: whenDriver(string()),
  driverTachographCardExpiryDate: whenDriver(string()),
  adrExpiryDate: whenDriver(string()),
  contractExpiryDate: whenDriver(string()),
  medicalExaminationExpiryDate: whenDriver(string()),
  visaExpiryDate: whenDriver(string()),
  code95ExpiryDate: whenDriver(string()),
  dateOfBirth: whenDriver(string()),
  residenceAddress: whenDriver(string()),
}).required();

function whenDriver(schema: Schema) {
  return schema.when('position', {
    is: PositionEnum.Driver,
    then: (s) => s.optional().nullable(),
    otherwise: (s) => s.nullable(),
  });
}
