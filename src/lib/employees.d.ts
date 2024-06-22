export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: string; // TODO Enum - Gender;
  position: string; // TODO Enum - Position;
  nationality: string;
  driverLicenceExpirationDate?: string;
  driverLicenceCategories?: string[]; // TODO - Enum
  adr?: boolean;
}

enum Gender {
  Male = 'M',
  Female = 'F',
}

enum Position {
  Driver = 'driver',
  Disponent = 'disponent',
  Manager  = 'manager'
}