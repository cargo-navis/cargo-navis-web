import { SelectOption } from '@/ui';

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

export const formDefaultValues = {
  brand: '',
  manufacturingYear: '',
  registration: '',
  registrationDate: undefined as unknown as string,
  registrationExpiryDate: undefined as unknown as string,
  emptyWeight: '',
  numberOfAxles: '',
};