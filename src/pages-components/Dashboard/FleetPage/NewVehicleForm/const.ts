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

export const equipmentOptions = [
  { value: EquipmentEnum.EDGE_PROTECTION, label: 'Edge Protection' },
  { value: EquipmentEnum.LASHING_CHAINS, label: 'Lashing Chains' },
  { value: EquipmentEnum.ANTI_SLIP_MATS, label: 'Anti Slip Mats' },
  { value: EquipmentEnum.ADR, label: 'ADR' },
  { value: EquipmentEnum.LASHING_STRAPS, label: 'Lashing Straps' },
  { value: EquipmentEnum.STANCHIONS, label: 'Stanchions' },
  { value: EquipmentEnum.CUSTOM_SEAL_STRING, label: 'Custom Seal String' },
  { value: EquipmentEnum.PORTABLE_FORKLIFT, label: 'Portable Forklift' },
  { value: EquipmentEnum.WASTE_CARRIER_LICENCE, label: 'Waste Carrier Licence' },
  { value: EquipmentEnum.MEAT_HOOK, label: 'Meat Hook' },
];

export const rampOptions: RadioOption[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
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
  [VehicleEnum.TRUCK]: 'Truck',
  [VehicleEnum.TRAILER]: 'Trailer',
  [VehicleEnum.SOLO_TRUCK]: 'Solo Truck',
  [VehicleEnum.VAN]: 'Van',
};
