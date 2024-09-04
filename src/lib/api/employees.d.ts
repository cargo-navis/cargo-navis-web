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
  Dispatcher = 'dispatcher',
  Manager  = 'manager',
  Ceo = 'ceo'
}

export type CreateEmployeeParams = Partial<Employee>;

export type UpdateEmployeeParams = Partial<CreateEmployeeParams>;