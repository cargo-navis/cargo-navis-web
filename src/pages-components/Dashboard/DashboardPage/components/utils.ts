import { AlertType, Employee, Vehicle } from '@/lib/api';

export const ruleToPropertyMap: Record<AlertType, keyof Employee | keyof Vehicle> = {
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: 'contractExpiryDate',
  [AlertType.DRIVER_LICENCE_EXPIRED]: 'driverLicenceExpiryDate',
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: 'professionalDriverLicenceExpiryDate',
  [AlertType.DRIVER_VISA_EXPIRED]: 'visaExpiryDate',
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: 'medicalExaminationExpiryDate',
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'registrationExpiryDate',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'technicalInspectionDate',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'adrExpiryDate',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'fireExtinguisherCheckExpiryDate',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'tachographExpiryDate',
};
