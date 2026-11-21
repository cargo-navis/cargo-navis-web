import dayjs from 'dayjs';
import * as Yup from 'yup';

import { NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { PalleteType } from '@/lib/utils/palletes';

import type { CargoType } from './types.d';

const cargoMetadataSchema = Yup.object().shape({
  type: Yup.string().oneOf<CargoType>(['standard', 'nonstandard']).required('Odaberi vrstu tereta.'),
  width: getSingleDimensionSchema(),
  height: getSingleDimensionSchema(),
  length: getSingleDimensionSchema(),
  palleteType: Yup.mixed<PalleteType>().when('type', {
    is: 'standard',
    then: () =>
      Yup.mixed<PalleteType>()
        .oneOf(Object.values(PalleteType), 'Odaberi vrstu palete.')
        .required('Odaberi vrstu palete.'),
    otherwise: () => Yup.mixed().strip(),
  }),
  palleteAmount: Yup.number().when('type', {
    is: 'standard',
    then: () =>
      Yup.number().typeError('Upiši broj paleta.').min(1, 'Najmanje 1 paleta.').required('Upiši broj paleta.'),
    otherwise: () => Yup.number().typeError('Upiši broj koleta.').min(1, 'Najmanje 1 komad.').optional(),
  }),
  hasKolete: Yup.boolean().when('type', {
    is: 'nonstandard',
    then: () => Yup.boolean().optional(),
    otherwise: () => Yup.boolean().strip(),
  }),
});

/** Shared with the utovar / istovar dialog's date check. */
export const cargoLoadUnloadDatesMessage = 'Rok istovara je prije utovara.';

const cargoSchema = Yup.object().shape({
  id: Yup.string().optional(),
  weight: Yup.number().typeError('Upiši težinu.').required('Upiši težinu.').positive('Težina mora biti veća od 0.'),
  description: Yup.string().optional(),
  ldm: Yup.number()
    .transform((value, original) => (original === '' ? undefined : value))
    .positive('LDM mora biti veći od 0.')
    .optional(),
  loadingAddress: getAddressSchema({ message: 'Dodaj utovar.' }),
  loadingCompanyName: Yup.string().optional(),
  // The order of the two dates is checked once, on the istovar (the same rule both ways).
  loadingReadyDate: Yup.string().optional(),
  loadingReference: Yup.string().optional(),
  loadingDescription: Yup.string().optional(),
  unloadingAddress: getAddressSchema({ message: 'Dodaj istovar.' }),
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
  metadata: cargoMetadataSchema.required('Odaberi vrstu tereta.'),
});

export const notificationEmailsSchema = Yup.array()
  .of(Yup.string().email('Neispravan email.').required())
  .max(NOTIFICATION_EMAIL_LIMIT, `Nalog može imati najviše ${NOTIFICATION_EMAIL_LIMIT} primatelja.`);

export function getShipmentSchema(tenantId: string) {
  return Yup.object()
    .shape({
      externalOrderReference: Yup.string().optional(),
      clientId: Yup.string()
        .required('Odaberi klijenta.')
        .test('not-tenant-when-agency', 'Tvoja tvrtka ne može biti klijent na agencijskom nalogu.', function (value) {
          const { isAgency } = this.parent as { isAgency?: boolean };
          return !(isAgency && value === tenantId);
        }),
      price: Yup.number()
        .typeError('Upiši cijenu.')
        .required('Upiši cijenu.')
        .positive('Cijena mora biti veća od 0.')
        .test('max-decimals', 'Najviše 2 decimale.', (value) => {
          if (value === undefined || value === null) return true;
          const decimalPlaces = (value.toString().split('.')[1] || '').length;
          return decimalPlaces <= 2;
        }),
      transportContractorId: Yup.string()
        .required('Odaberi podvozara.')
        .test('not-tenant-when-agency', 'Tvoja tvrtka ne može biti podvozar na agencijskom nalogu.', function (value) {
          const { isAgency } = this.parent as { isAgency?: boolean };
          return !(isAgency && value === tenantId);
        }),
      isAgency: Yup.boolean().optional(),
      agencyPrice: Yup.number()
        .transform((value, original) => (original === '' || original === null ? undefined : value))
        .when('isAgency', {
          is: true,
          then: () =>
            Yup.number()
              .typeError('Upiši cijenu podvozara.')
              .required('Upiši cijenu podvozara.')
              .positive('Cijena mora biti veća od 0.'),
          otherwise: () => Yup.number().optional().nullable().strip(),
        }),
      notificationEmails: notificationEmailsSchema,
      cargo: Yup.array().of(cargoSchema).required('Dodaj barem jedan teret.'),
    })
    .test('tenant-participation', '', function (values) {
      const { isAgency, transportContractorId, clientId } = values as {
        isAgency?: boolean;
        transportContractorId?: string;
        clientId?: string;
      };
      if (isAgency) return true;

      const tenantCount = (transportContractorId === tenantId ? 1 : 0) + (clientId === tenantId ? 1 : 0);

      // Own nalog: the form sets the tenant as the contractor, so a problem here is about the client.
      if (tenantCount === 0) {
        return this.createError({
          path: 'clientId',
          message: 'Tvoja tvrtka mora biti klijent ili podvozar.',
        });
      }
      if (tenantCount === 2) {
        return this.createError({
          path: 'clientId',
          message: 'Tvoja tvrtka ne može biti klijent na vlastitom prijevozu.',
        });
      }
      return true;
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
          .positive('Mora biti veće od 0.')
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
          label: Yup.string().required(message),
          value: Yup.string().required(message),
        })
        .required(message),
      countryCode: Yup.string().optional(),
    })
    .required(message);
}
