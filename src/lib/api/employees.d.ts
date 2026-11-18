import type { DriverLicenceEnum, GenderEnum, MessageChannelEnum, PositionEnum } from './employees';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: GenderEnum;
  positions: PositionEnum[];
  governmentId: string;
  governmentIdExpiryDate?: string;
  driverLicenceId?: string;
  nationality: string;
  driverLicenceCategories?: DriverLicenceEnum[];
  driverLicenceExpiryDate?: string;
  professionalDriverLicenceExpiryDate?: string;
  adrExpiryDate?: string;
  contractExpiryDate?: string;
  medicalExaminationExpiryDate?: string;
  visaExpiryDate?: string;
  code95ExpiryDate?: string;
  postingDeclarationExpiryDate?: string;
  dateOfBirth?: string;
  residenceAddress?: string;
  driverTachographCardId?: string;
  driverTachographCardExpiryDate?: string;
  messageChannel?: MessageChannelEnum | null;
  hasSetPassword: boolean;
  deleted: boolean;
  documents?: {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    status: string;
  }[];
}

export type CreateEmployeeParams = Partial<Employee>;

export type UpdateEmployeeParams = Partial<CreateEmployeeParams>;

export interface DriverPortalToken {
  token: string;
}
