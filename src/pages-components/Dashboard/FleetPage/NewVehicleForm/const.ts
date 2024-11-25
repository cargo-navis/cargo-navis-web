import { EmissionStandard, EquipmentEnum, VehicleEnum, VehicleLoadEnum } from '@/lib/api';
import type { RadioOption, SelectOption } from '@/ui';

export const truckBrandOptions: SelectOption[] = [
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Scania', label: 'Scania' },
  { value: 'MAN', label: 'MAN' },
  { value: 'DAF', label: 'DAF' },
  { value: 'Iveco', label: 'Iveco' },
  { value: 'Kenworth', label: 'Kenworth' },
  { value: 'International', label: 'International' },
  { value: 'Western Star', label: 'Western Star' },
  { value: 'Renault Trucks', label: 'Renault Trucks' },
  { value: 'Mitsubishi Fuso', label: 'Mitsubishi Fuso' },
];

export const trailerBrandOptions: SelectOption[] = [
  { value: 'Schmitz Cargobull', label: 'Schmitz Cargobull' },
  { value: 'Krone', label: 'Krone' },
  { value: 'Kögel', label: 'Kögel' },
  { value: 'Schwarzmüller', label: 'Schwarzmüller' },
  { value: 'Wielton', label: 'Wielton' },
  { value: 'SDC', label: 'SDC' },
  { value: 'Fliegl', label: 'Fliegl' },
  { value: 'LAMBERET', label: 'LAMBERET' },
  { value: 'Fruehauf', label: 'Fruehauf' },
  { value: 'Van Hool', label: 'Van Hool' },
  { value: 'Benalu', label: 'Benalu' },
  { value: 'Langendorf', label: 'Langendorf' },
  { value: 'Chereau', label: 'Chereau' },
  { value: 'Tirsan', label: 'Tirsan' },
  { value: 'Kaessbohrer', label: 'Kaessbohrer' },
];

export const vanBrandOptions = [
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Ford', label: 'Ford' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Peugeot', label: 'Peugeot' },
  { value: 'Citroën', label: 'Citroën' },
  { value: 'Fiat', label: 'Fiat' },
  { value: 'Opel', label: 'Opel' },
  { value: 'Iveco', label: 'Iveco' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'MAN', label: 'MAN' },
  { value: 'Dacia', label: 'Dacia' },
];

export const typeBrandOptionsMap: Record<VehicleEnum, SelectOption[]> = {
  [VehicleEnum.TRUCK]: truckBrandOptions,
  [VehicleEnum.TRAILER]: trailerBrandOptions,
  [VehicleEnum.SOLO_TRUCK]: truckBrandOptions,
  [VehicleEnum.VAN]: vanBrandOptions,
};

export const emissionStandardOptions: SelectOption[] = [
  { value: EmissionStandard.Euro1, label: 'EURO 1' },
  { value: EmissionStandard.Euro2, label: 'EURO 2' },
  { value: EmissionStandard.Euro3, label: 'EURO 3' },
  { value: EmissionStandard.Euro4, label: 'EURO 4' },
  { value: EmissionStandard.Euro5, label: 'EURO 5' },
  { value: EmissionStandard.Euro6, label: 'EURO 6' },
  { value: EmissionStandard.Euro7, label: 'EURO 7' },
  { value: EmissionStandard.Euro8, label: 'EURO 8' },
];

export const equipmentNameMap = {
  [EquipmentEnum.EDGE_PROTECTION]: 'Kutnici',
  [EquipmentEnum.LASHING_CHAINS]: 'Lanci',
  [EquipmentEnum.ANTI_SLIP_MATS]: 'Protuklizne podloge',
  [EquipmentEnum.ADR]: 'ADR',
  [EquipmentEnum.LASHING_STRAPS]: 'Zatezni pojasevi',
  [EquipmentEnum.STANCHIONS]: 'Stupovi',
  [EquipmentEnum.CUSTOM_SEAL_STRING]: 'Carinsko uže',
  [EquipmentEnum.PORTABLE_FORKLIFT]: 'Ručni viljuškar',
  [EquipmentEnum.WASTE_CARRIER_LICENCE]: 'Ploče za označavanje otpada',
  [EquipmentEnum.MEAT_HOOK]: 'Kuke za meso',
  [EquipmentEnum.PALLETS]: 'Palete',
};

export const equipmentOptions = Object.entries(equipmentNameMap).map(([value, label]) => {
  return { label, value };
});

export const rampOptions: RadioOption[] = [
  { label: 'Da', value: true },
  { label: 'Ne', value: false },
];

export const loadTypeOptions: SelectOption[] = [
  { value: VehicleLoadEnum.TILT_TRUCK, label: 'Tilt Truck' },
  { value: VehicleLoadEnum.FURGON, label: 'Furgon' },
  { value: VehicleLoadEnum.FRIGO, label: 'Frigo' },
  { value: VehicleLoadEnum.CISTERN, label: 'Cistern' },
  { value: VehicleLoadEnum.CONTAINER_TRAILER, label: 'Undercarriage for containers' },
  { value: VehicleLoadEnum.TAUTLINER, label: 'Tautliner' },
];

export const formDefaultValues = {
  brand: '',
  manufacturingYear: 0,
  registration: '',
  registrationDate: undefined as unknown as string,
  registrationExpiryDate: undefined as unknown as string,
  emptyWeight: 0,
  numberOfAxles: 0,
  technicalInspectionExpiryDate: undefined as unknown as string,
  periodicalTechnicalInspectionExpiryDate: undefined as unknown as string,
  smallServiceExpiryDate: undefined as unknown as string,
  bigServiceExpiryDate: undefined as unknown as string,
  tiresReplacementExpiryDate: undefined as unknown as string,
  mandatoryInsuranceExpiryDate: undefined as unknown as string,
  leasingExpiryDate: undefined as unknown as string,
};

export const truckFormDefaultValues = {
  enginePower: 0,
  emissionStandard: EmissionStandard.Euro1,
  tankSize: 0,
  averageFuelConsumption: 0,
  technicalInspectionExpiryDate: undefined as unknown as string,
};

export const trailerFormDefaultValues = {
  loadCapacity: 0,
  width: 0,
  height: 0,
  length: 0,
  codeXlCertificateExpiryDate: undefined as unknown as string,
  ramp: false,
  vehicleLoadType: VehicleLoadEnum.TILT_TRUCK,
  equipment: [],
};

export const typeNameMap: Record<VehicleEnum, string> = {
  [VehicleEnum.TRUCK]: 'Tegljač',
  [VehicleEnum.TRAILER]: 'Poluprikolicu',
  [VehicleEnum.SOLO_TRUCK]: 'Solo Kamion',
  [VehicleEnum.VAN]: 'Kombij',
};
