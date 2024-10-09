import { GenderEnum, PositionEnum } from '@/lib/api';

export enum AlertType {
  EMPLOYEE_CONTRACT_EXPIRED = 'EMP_CONTRACT_EXP',
  DRIVER_LICENCE_EXPIRED = 'DRI_LICENCE_EXP',
  PROFESSIONAL_DRIVER_LICENCE_EXPIRED = 'PRO_DRI_LICENCE_EXP',
  DRIVER_VISA_EXPIRED = 'DRI_VISA_EPX',
  DRIVER_MEDICAL_EXAMINATION_EXPIRED = 'DRI_MED_EXAM_EXP',
  VEHICLE_REGISTRATION_EXPIRED = 'VEH_REG_EXP',
  VEHICLE_TECHNICAL_INSPECTION_EXPIRED = 'VEH_TECH_EXP',
  VEHICLE_ADR_EXPIRED = 'VEH_ADR_EXP',
  VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED = 'VEH_FIRE_EXP',
  VEHICLE_TACHOGRAPH_EXPIRED = 'VEH_TACHO_EXP',
}

export interface Alert {
  ruleName: AlertType;
  alertable: any;
}

export const alerts: Alert[] = [
  {
    ruleName: AlertType.DRIVER_LICENCE_EXPIRED,
    alertable: {
      id: 'f1b7d0a5-7c3a-4e5a-8c1e-1d0b1e2f3a7b',
      firstName: 'Filip',
      lastName: 'Lovrić',
      phoneNumber: '+385123456794',
      email: 'filip.lovric@example.com',
      gender: GenderEnum.Male,
      position: PositionEnum.Driver,
      nationality: 'Croatian',
      driverLicenceExpiryDate: '2025-12-15',
      driverLicenceCategories: ['b', 'b2', 'c'],
      adr: 'adr_false',
      governmentId: 'HR12345692',
    },
  },
  {
    ruleName: AlertType.DRIVER_VISA_EXPIRED,
    alertable: {
      id: 'd2e7c3b5-5a4c-4f6a-8c1e-2d0b1f3e2a7b',
      firstName: 'Teo',
      lastName: 'Kralj',
      phoneNumber: '+385123456795',
      email: 'teo.kralj@example.com',
      gender: GenderEnum.Male,
      position: PositionEnum.Driver,
      nationality: 'Croatian',
      driverLicenceExpiryDate: '2025-12-16',
      driverLicenceCategories: ['b', 'c'],
      adr: 'adr_false',
      governmentId: 'HR12345693',
    },
  },
  {
    ruleName: AlertType.EMPLOYEE_CONTRACT_EXPIRED,
    alertable: {
      id: 'e4b7d0a5-8c3a-4e5a-9c1e-3d0b1e2f3a7b',
      firstName: 'Tomislav',
      lastName: 'Barišić',
      phoneNumber: '+385123456796',
      email: 'tomislav.barisic@example.com',
      gender: GenderEnum.Male,
      position: PositionEnum.Driver,
      nationality: 'Croatian',
      driverLicenceExpiryDate: '2025-12-17',
      driverLicenceCategories: ['b'],
      adr: 'adr_false',
      governmentId: 'HR12345694',
    },
  },
  {
    ruleName: AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED,
    alertable: {
      id: 'e4b7d0a5-8c3a-4e5a-9c1e-3d0b1e2f3a7b',
      firstName: 'Tomislav',
      lastName: 'Barišić',
      phoneNumber: '+385123456796',
      email: 'tomislav.barisic@example.com',
      gender: GenderEnum.Male,
      position: PositionEnum.Driver,
      nationality: 'Croatian',
      driverLicenceExpiryDate: '2025-12-17',
      driverLicenceCategories: ['B'],
      adr: 'adr_false',
      governmentId: 'HR12345694',
    },
  },
  {
    ruleName: AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED,
    alertable: {
      id: 'f4b7d0c5-7c3a-4e6a-9b1e-8d0b1e2f3a7b',
      firstName: 'Tiho',
      lastName: 'Matić',
      phoneNumber: '+385123456801',
      email: 'tiho.matic@example.com',
      gender: GenderEnum.Male,
      position: PositionEnum.Driver,
      nationality: 'Croatian',
      driverLicenceExpiryDate: '2025-12-22',
      driverLicenceCategories: ['b', 'c'],
      adr: 'adr_false',
      governmentId: 'HR12345699',
    },
  }
];
