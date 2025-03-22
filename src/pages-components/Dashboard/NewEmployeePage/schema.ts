import { array, object, type Schema, string } from 'yup';

import { PositionEnum } from '@/lib/api/employees.d';

// Helper function to create a trimmed string schema
const trimmedString = () => string().transform((value) => (value ? value.trim() : value));

export const employeeSchema = object({
  firstName: trimmedString().required('First name is required'),
  lastName: trimmedString().required('Last name is required'),
  position: string().oneOf(Object.values(PositionEnum)).required('Position is required'),
  email: trimmedString().email('Email must be valid').optional().nullable(),
  phoneNumber: trimmedString().optional(),
  governmentId: whenDriver(string()),
  governmentIdExpiryDate: whenDriver(string()),
  driverLicenceId: whenDriver(string()),
  driverLicenceExpiryDate: whenDriver(string()),
  driverLicenceCategories: whenDriver(array(string())),
  professionalDriverLicenceExpiryDate: whenDriver(string()),
  nationality: whenDriver(trimmedString()),
  driverTachographCardId: whenDriver(string()),
  driverTachographCardExpiryDate: whenDriver(string()),
  adrExpiryDate: whenDriver(string()),
  contractExpiryDate: whenDriver(string()),
  medicalExaminationExpiryDate: whenDriver(string()),
  visaExpiryDate: whenDriver(string()),
  code95ExpiryDate: whenDriver(string()),
  dateOfBirth: whenDriver(string()),
  residenceAddress: whenDriver(trimmedString()),
}).required();

function whenDriver(schema: Schema) {
  return schema.when('position', {
    is: PositionEnum.Driver,
    then: (s) => s.optional().nullable(),
    otherwise: (s) => s.nullable(),
  });
}
