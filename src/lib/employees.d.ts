export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: GenderEnum;
  position: PositionEnum;
  nationality: string;
  driverLicenceExpirationDate?: string;
  driverLicenceCategories?: string[]; // TODO - Enum
  adr?: string;
  governmentId: string;
}

export enum GenderEnum {
  Male = 'M',
  Female = 'F',
}

export enum PositionEnum {
  Driver = 'driver',
  Dispatcher = 'disponent',
  Manager  = 'manager',
  Ceo = 'ceo,'
}