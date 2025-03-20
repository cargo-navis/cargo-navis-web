import * as Yup from 'yup';

import { PalleteType } from '@/lib/utils/palletes';

import type { CargoType } from './types.d';

export const shipmentSchema = Yup.object().shape({
  orderNumber: Yup.string().required('Broj naloga je obavezan'),
  cargoReference: Yup.string().optional(),
  dispatcherId: Yup.string().optional(),
  clientId: Yup.string().optional(),
  transportContractorId: Yup.string().optional(),
  driverId: Yup.string().optional(),
  vehicleId: Yup.string().optional(),
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
  loadingReadyDate: Yup.string().optional(),
  loadingDate: Yup.string().optional(),
  loadingDescription: Yup.string().optional(),
  unloadingDate: Yup.string().optional(),
  unloadingDueDate: Yup.string().optional(),
  unloadingDescription: Yup.string().optional(),
  price: Yup.number()
    .typeError('Cijena mora biti pozitivan broj')
    .min(0, 'Cijena mora biti najmanje 0')
    .positive('Mora biti pozitivan broj')
    .optional(),
  cargo: Yup.array()
    .of(
      Yup.object().shape({
        weight: Yup.number().typeError('Težina je obavezna').positive('Mora biti pozitivan broj').required(),
        description: Yup.string().optional(),
        ldm: Yup.number().typeError('LDM je obavezan').positive('Mora biti pozitivan broj').required(),
        metadata: Yup.object()
          .shape({
            type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Tip tereta je obavezan'),
            width: Yup.number().typeError('Širina je obavezna').positive('Mora biti pozitivan broj').optional(),
            height: Yup.number().typeError('Visina je obavezna').positive('Mora biti pozitivan broj').optional(),
            length: Yup.number().typeError('Duljina je obavezna').positive('Mora biti pozitivan broj').optional(),
            palleteType: Yup.mixed<PalleteType>().oneOf(Object.values(PalleteType)).optional(),
            palleteAmount: Yup.number()
              .typeError('Količina paleta je obavezna')
              .min(1, 'Količina paleta mora biti najmanje 1')
              .optional(),
          })
          .required('Podaci tereta su obavezni'),
      })
    )
    .required('Potreban je najmanje jedan teret'),
});
