export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string; // TODO - Enum
  position: string; // TODO - Enum
  nationality: string;
  driverLicenceExpirationDate: string;
  driverLicenceCategories: string[]; // TODO - Enum
}
