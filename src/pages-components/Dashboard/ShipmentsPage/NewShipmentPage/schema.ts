import dayjs from 'dayjs';
import * as Yup from 'yup';

import { PalleteType } from '@/lib/utils/palletes';

import type { CargoType } from './types.d';

const cargoMetadataSchema = Yup.object().shape({
  type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Tip tereta je obavezan'),
  width: getSingleDimensionSchema(),
  height: getSingleDimensionSchema(),
  length: getSingleDimensionSchema(),
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

/** Shared with CargoLoadModal date validation */
export const cargoLoadUnloadDatesMessage = 'Krajnji rok za istovar mora biti na ili nakon datuma spremnosti za utovar.';

const cargoSchema = Yup.object().shape({
  id: Yup.string().optional(),
  weight: Yup.number()
    .typeError('Težina mora biti broj')
    .required('Težina je obavezna')
    .positive('Težina mora biti pozitivan broj'),
  description: Yup.string().optional(),
  ldm: Yup.number()
    .transform((value, original) => (original === '' ? undefined : value))
    .positive('Mora biti pozitivan broj')
    .optional(),
  loadingAddress: getAddressSchema({ message: 'Adresa utovara je obavezna' }),
  loadingCompanyName: Yup.string().optional(),
  loadingReadyDate: Yup.string()
    .optional()
    .test('not-after-unload', cargoLoadUnloadDatesMessage, function (loadVal) {
      const unloadRaw = (this.parent as { unloadingDueDate?: string })?.unloadingDueDate?.trim();
      if (!String(loadVal ?? '').trim() || !unloadRaw) return true;
      const load = dayjs(loadVal);
      const unload = dayjs(unloadRaw);
      if (!load.isValid() || !unload.isValid()) return true;
      return !load.isAfter(unload, 'day');
    }),
  loadingReference: Yup.string().optional(),
  loadingDescription: Yup.string().optional(),
  unloadingAddress: getAddressSchema({ message: 'Adresa istovara je obavezna' }),
  unloadingCompanyName: Yup.string().optional(),
  unloadingDueDate: Yup.string()
    .optional()
    .test('not-before-load', cargoLoadUnloadDatesMessage, function (unloadVal) {
      const loadRaw = (this.parent as { loadingReadyDate?: string })?.loadingReadyDate?.trim();
      if (!String(unloadVal ?? '').trim() || !loadRaw) return true;
      const load = dayjs(loadRaw);
      const unload = dayjs(unloadVal);
      if (!load.isValid() || !unload.isValid()) return true;
      return !unload.isBefore(load, 'day');
    }),
  unloadingReference: Yup.string().optional(),
  unloadingDescription: Yup.string().optional(),
  metadata: cargoMetadataSchema.required('Podaci tereta su obavezni'),
});

export function getShipmentSchema(tenantId: string) {
  return Yup.object()
    .shape({
      externalOrderReference: Yup.string().optional(),
      clientId: Yup.string()
        .required('Klijent je obavezan')
        .test('not-tenant-when-agency', 'Vaša tvrtka ne može biti klijent kod agencijskog naloga', function (value) {
          const { isAgency } = this.parent as { isAgency?: boolean };
          return !(isAgency && value === tenantId);
        }),
      price: Yup.number()
        .typeError('Cijena mora biti broj')
        .required('Cijena je obavezna')
        .positive('Cijena mora biti pozitivan broj')
        .test('max-decimals', 'Cijena može imati maksimalno 2 decimale', (value) => {
          if (value === undefined || value === null) return true;
          const decimalPlaces = (value.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }),
      transportContractorId: Yup.string()
        .required('Prijevoznik je obavezan')
        .test(
          'not-tenant-when-agency',
          'Vaša tvrtka ne može biti prijevoznik kod agencijskog naloga',
          function (value) {
            const { isAgency } = this.parent as { isAgency?: boolean };
            return !(isAgency && value === tenantId);
          }
        ),
      isAgency: Yup.boolean().optional(),
      agencyPrice: Yup.number()
        .transform((value, original) => (original === '' || original === null ? undefined : value))
        .when('isAgency', {
          is: true,
          then: () =>
            Yup.number()
              .typeError('Cijena agencijskog prijevoza mora biti broj')
              .required('Cijena agencijskog prijevoza je obavezna')
              .positive('Cijena mora biti pozitivan broj'),
          otherwise: () => Yup.number().optional().nullable().strip(),
        }),
      cargo: Yup.array().of(cargoSchema).required('Potreban je najmanje jedan teret'),
    })
    .test('tenant-participation', '', function (values) {
      const { isAgency, transportContractorId, clientId } = values as {
        isAgency?: boolean;
        transportContractorId?: string;
        clientId?: string;
      };
      if (isAgency) return true;

      if (transportContractorId === tenantId || clientId === tenantId) return true;

      return this.createError({
        path: 'transportContractorId',
        message: 'Vaša tvrtka mora biti odabrana kao klijent ili prijevoznik',
      });
    });
}

function getSingleDimensionSchema() {
  return Yup.number()
    .transform((value, original) => (original === '' ? undefined : value))
    .when('type', {
      is: 'nonstandard',
      then: () =>
        Yup.number()
          .transform((value, original) => (original === '' ? undefined : value))
          .positive('Mora biti pozitivan broj')
          .optional(),
      otherwise: () => Yup.number().strip(),
    });
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
