import { array, object, type Schema, string } from 'yup';

import { PositionEnum } from '@/lib/api/employees.d';

// Helper function to create a trimmed string schema
const trimmedString = () => string().transform((value) => (value ? value.trim() : value));

export const employeeSchema = object({
  firstName: trimmedString().required('Ime je obavezno'),
  lastName: trimmedString().required('Prezime je obavezno'),
  position: string().oneOf(Object.values(PositionEnum)).required('Pozicija je obavezna'),
  email: trimmedString().email('Email mora biti validan').optional().nullable(),
  phoneNumber: object()
    .shape({
      countryCode: string().required('Država je obavezna'),
      phoneNumber: trimmedString().required('Broj telefona je obavezan'),
    })
    .required('Broj telefona je obavezan'),
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
