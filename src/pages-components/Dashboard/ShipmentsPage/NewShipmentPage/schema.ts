import * as Yup from 'yup';

import { PalleteType } from '@/lib/utils/palletes';

import type { CargoType } from './types.d';

const cargoMetadataSchema = Yup.object().shape({
  type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Tip tereta je obavezan'),
  width: getSingleDimensionSchema({ message: 'Širina je obavezna' }),
  height: getSingleDimensionSchema({ message: 'Visina je obavezna' }),
  length: getSingleDimensionSchema({ message: 'Duljina je obavezna' }),
  palleteType: Yup.mixed<PalleteType>().when('type', {
    is: 'standard',
    then: () => Yup.mixed<PalleteType>().oneOf(Object.values(PalleteType)).required('Vrsta palete je obavezna'),
    otherwise: () => Yup.mixed().strip(),
  }),
  palleteAmount: Yup.number().when('type', {
    is: 'standard',
    then: () =>
      Yup.number()
        .typeError('Količina paleta je obavezna')
        .min(1, 'Količina paleta mora biti najmanje 1')
        .required('Količina paleta je obavezna'),
    otherwise: () =>
      Yup.number()
        .typeError('Količina paleta mora biti broj')
        .min(1, 'Količina paleta mora biti najmanje 1')
        .optional(),
  }),
  hasKolete: Yup.boolean().when('type', {
    is: 'nonstandard',
    then: () => Yup.boolean().optional(),
    otherwise: () => Yup.boolean().strip(),
  }),
});

const cargoSchema = Yup.object().shape({
  id: Yup.string().optional(),
  weight: Yup.number().typeError('Težina je obavezna').positive('Mora biti pozitivan broj').required(),
  description: Yup.string().optional(),
  ldm: Yup.number().typeError('LDM je obavezan').positive('Mora biti pozitivan broj').required(),
  loadingAddress: getAddressSchema({ message: 'Adresa utovara je obavezna' }),
  loadingCompanyName: Yup.string().optional(),
  loadingDate: getRequiredDateSchema({ message: 'Datum utovara je obavezan' }),
  loadingReadyDate: Yup.string().optional(),
  loadingReference: Yup.string().optional(),
  loadingDescription: Yup.string().optional(),
  unloadingAddress: getAddressSchema({ message: 'Adresa istovara je obavezna' }),
  unloadingCompanyName: Yup.string().optional(),
  unloadingDate: getRequiredDateSchema({ message: 'Datum istovara je obavezan' }),
  unloadingDueDate: Yup.string().optional(),
  unloadingReference: Yup.string().optional(),
  unloadingDescription: Yup.string().optional(),
  metadata: cargoMetadataSchema.required('Podaci tereta su obavezni'),
});

export const shipmentSchema = Yup.object().shape({
  cargoReference: Yup.string().optional(),
  dispatcherId: Yup.string().required('Disponent je obavezan'),
  clientId: Yup.string().required('Klijent je obavezan'),
  isAgencyUse: Yup.boolean().optional(),
  price: Yup.number()
    .typeError('Cijena mora biti pozitivan broj')
    .min(0, 'Cijena mora biti najmanje 0')
    .positive('Mora biti pozitivan broj')
    .test('max-decimals', 'Cijena može imati maksimalno 2 decimale', (value) => {
      if (value === undefined || value === null) return true;
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    })
    .optional(),
  transportContractorId: Yup.string().required('Prijevoznik je obavezan'),
  driverId: Yup.string().optional().nullable(),
  vehicleId: Yup.string().optional().nullable(),
  trailerId: Yup.string().optional().nullable(),
  cargo: Yup.array().of(cargoSchema).required('Potreban je najmanje jedan teret'),
});

function getSingleDimensionSchema({ message }: { message: string }) {
  return Yup.number().when('type', {
    is: 'nonstandard',
    then: () => Yup.number().typeError(message).positive('Mora biti pozitivan broj').required(message),
    otherwise: () => Yup.number().strip(),
  });
}

export function getRequiredDateSchema({ message }: { message: string }) {
  return Yup.string()
    .required(message)
    .test('not-empty', message, (value) => value !== undefined && value !== null && value.trim() !== '');
}

export function getAddressSchema({ message }: { message: string }) {
  return Yup.object()
    .shape({
      streetName: Yup.string().required(message),
      postalCodeId: Yup.object()
        .shape({
          label: Yup.string().required(),
          value: Yup.string().required(),
        })
        .required('Poštanski broj je obavezan'),
      countryCode: Yup.string().optional(),
    })
    .required(message);
}
