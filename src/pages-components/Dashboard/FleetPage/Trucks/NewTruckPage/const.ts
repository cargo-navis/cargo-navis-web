import { EmissionStandard } from '@/lib/api';
import type { SelectOption } from '@/ui';

export const vehicleModelOptions: SelectOption[] = [
  { value: 'volvo', label: 'Volvo' },
  { value: 'mercedes', label: 'Mercedes-Benz' },
  { value: 'scania', label: 'Scania' },
  { value: 'man', label: 'MAN' },
  { value: 'daf', label: 'DAF' },
  { value: 'iveco', label: 'Iveco' },
  { value: 'kenworth', label: 'Kenworth' },
  { value: 'international', label: 'International' },
  { value: 'western_star', label: 'Western Star' },
  { value: 'renault', label: 'Renault Trucks' },
  { value: 'fuso', label: 'Mitsubishi Fuso' },
];

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

export const formDefaultValues = {
  brand: '',
  manufacturingYear: '',
  registration: '',
  registrationDate: undefined as unknown as string,
  registrationExpiryDate: undefined as unknown as string,
  emptyWeight: '',
  numberOfAxles: '',
};

export const truckFormDefaultValues = {
  enginePower: '',
  emissionStandard: EmissionStandard.Euro1,
  tankSize: '',
  averageFuelConsumption: '',
};
