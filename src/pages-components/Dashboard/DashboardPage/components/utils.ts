import { AlertType, type Employee, type Vehicle } from '@/lib/api';

export const ruleToPropertyMap: Record<AlertType, keyof Employee | keyof Vehicle> = {
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: 'contractExpiryDate',
  [AlertType.DRIVER_LICENCE_EXPIRED]: 'driverLicenceExpiryDate',
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: 'professionalDriverLicenceExpiryDate',
  [AlertType.DRIVER_VISA_EXPIRED]: 'visaExpiryDate',
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: 'medicalExaminationExpiryDate',
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'registrationExpiryDate',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'technicalInspectionExpiryDate',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'adrExpiryDate',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'fireExtinguisherCheckExpiryDate',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'tachographExpiryDate',
};

export const ruleToTextMap: Record<AlertType, string> = {
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: 'Ugovor o zaposlenju',
  [AlertType.DRIVER_LICENCE_EXPIRED]: 'Vozačka dozvola',
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: 'Profesionalna vozačka dozvola',
  [AlertType.DRIVER_VISA_EXPIRED]: 'Viza',
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: 'Lječnički pregled',
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'Registracija vozila',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'Tehnički pregled',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'ADR',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'Valjanost protupožarnog aparata',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'Tahograf',
};
