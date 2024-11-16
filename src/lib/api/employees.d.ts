export enum DriverLicenceEnum {
  B1 = 'B1',
  B = 'B',
  C1 = 'C1',
  C = 'C',
  C1E = 'C1E',
  CE = 'CE',
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  gender: GenderEnum;
  position: PositionEnum;
  governmentId: string;
  adr?: string;
  nationality: string;
  driverLicenceCategories?: DriverLicenceEnum[];
  driverLicenceExpiryDate?: string;
  professionalDriverLicenceExpiryDate?: string;
  contractExpiryDate?: string;
  medicalExaminationExpiryDate?: string;
  visaExpiryDate?: string;
  code95ExpiryDate?: string;
}

export enum GenderEnum {
  Male = 'M',
  Female = 'F',
}

export enum PositionEnum {
  Driver = 'driver',
  Dispatcher = 'dispatcher',
  Manager = 'manager',
  Ceo = 'ceo',
}

export type CreateEmployeeParams = Partial<Employee>;

export type UpdateEmployeeParams = Partial<CreateEmployeeParams>;
