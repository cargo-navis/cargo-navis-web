import * as Yup from 'yup';

import { PalleteType } from '@/lib/utils/pallete';

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
  price: Yup.number().min(0, 'Cijena mora biti najmanje 0').optional(),
  cargo: Yup.array()
    .of(
      Yup.object().shape({
        weight: Yup.number().required(),
        description: Yup.string().optional(),
        ldm: Yup.number().required(),
        metadata: Yup.object()
          .shape({
            type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Tip tereta je obavezan'),
            width: Yup.number().optional(),
            height: Yup.number().optional(),
            length: Yup.number().optional(),
            palleteType: Yup.mixed<PalleteType>().oneOf(Object.values(PalleteType)).optional(),
            palleteAmount: Yup.number().min(1, 'Količina paleta mora biti najmanje 1').optional(),
          })
          .required('Podaci tereta su obavezni'),
      })
    )
    .required('Potreban je najmanje jedan teret'),
});
