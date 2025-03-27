import * as Yup from 'yup';

import { PalleteType } from '@/lib/utils/palletes';

import type { CargoType } from './types.d';

export const shipmentSchema = Yup.object().shape({
  orderNumber: Yup.string().required('Broj naloga je obavezan'),
  cargoReference: Yup.string().optional(),
  dispatcherId: Yup.string().required('Disponent je obavezan'),
  clientId: Yup.string().required('Klijent je obavezan'),
  price: Yup.number()
    .typeError('Cijena mora biti pozitivan broj')
    .min(0, 'Cijena mora biti najmanje 0')
    .positive('Mora biti pozitivan broj')
    .optional(),
  transportContractorId: Yup.string().optional(),
  driverId: Yup.string().optional(),
  vehicleId: Yup.string().optional(),
  trailerId: Yup.string().optional(),
  loadingAddress: Yup.object()
    .shape({
      name: Yup.string().required('Adresa utovara je obavezna'),
      postalCodeId: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.string(),
        })
        .required('Poštanski broj je obavezan'),
      countryCode: Yup.string().optional(),
    })
    .optional(),
  unloadingAddress: Yup.object()
    .shape({
      name: Yup.string().required('Adresa istovara je obavezna'),
      postalCodeId: Yup.object()
        .shape({
          label: Yup.string(),
          value: Yup.string(),
        })
        .required('Poštanski broj je obavezan'),
      countryCode: Yup.string().optional(),
    })
    .optional(),
  loadingCompanyName: Yup.string().optional(),
  unloadingCompanyName: Yup.string().optional(),
  loadingReadyDate: Yup.string()
    .required('Datum spremnosti utovara je obavezan')
    .test(
      'not-empty',
      'Datum spremnosti utovara je obavezan',
      (value) => value !== undefined && value !== null && value.trim() !== ''
    ),
  loadingDate: Yup.string().optional(),
  loadingDescription: Yup.string().optional(),
  unloadingDate: Yup.string().optional(),
  unloadingDueDate: Yup.string()
    .required('Rok istovara je obavezan')
    .test(
      'not-empty',
      'Rok istovara je obavezan',
      (value) => value !== undefined && value !== null && value.trim() !== ''
    ),
  unloadingDescription: Yup.string().optional(),
  cargo: Yup.array()
    .of(
      Yup.object().shape({
        weight: Yup.number().typeError('Težina je obavezna').positive('Mora biti pozitivan broj').required(),
        description: Yup.string().optional(),
        ldm: Yup.number().typeError('LDM je obavezan').positive('Mora biti pozitivan broj').required(),
        metadata: Yup.object()
          .shape({
            type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Tip tereta je obavezan'),
            width: Yup.number().when('type', {
              is: 'nonstandard',
              then: () =>
                Yup.number()
                  .typeError('Širina je obavezna')
                  .positive('Mora biti pozitivan broj')
                  .required('Širina je obavezna'),
              otherwise: () => Yup.number().strip(),
            }),
            height: Yup.number().when('type', {
              is: 'nonstandard',
              then: () =>
                Yup.number()
                  .typeError('Visina je obavezna')
                  .positive('Mora biti pozitivan broj')
                  .required('Visina je obavezna'),
              otherwise: () => Yup.number().strip(),
            }),
            length: Yup.number().when('type', {
              is: 'nonstandard',
              then: () =>
                Yup.number()
                  .typeError('Duljina je obavezna')
                  .positive('Mora biti pozitivan broj')
                  .required('Duljina je obavezna'),
              otherwise: () => Yup.number().strip(),
            }),
            palleteType: Yup.mixed<PalleteType>().when('type', {
              is: 'standard',
              then: () =>
                Yup.mixed<PalleteType>().oneOf(Object.values(PalleteType)).required('Vrsta palete je obavezna'),
              otherwise: () => Yup.mixed().strip(),
            }),
            palleteAmount: Yup.number().when('type', {
              is: 'standard',
              then: () =>
                Yup.number()
                  .typeError('Količina paleta je obavezna')
                  .min(1, 'Količina paleta mora biti najmanje 1')
                  .required('Količina paleta je obavezna'),
              otherwise: () => Yup.number().strip(),
            }),
          })
          .required('Podaci tereta su obavezni'),
      })
    )
    .required('Potreban je najmanje jedan teret'),
});
