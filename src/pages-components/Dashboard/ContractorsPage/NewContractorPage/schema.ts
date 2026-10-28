import * as yup from 'yup';

import { COMPANY_NAME_MAX_LENGTH } from '@/lib/utils/companies';

export const contractorSchema = yup.object().shape({
  name: yup
    .string()
    .required('Ime je obavezno')
    .max(COMPANY_NAME_MAX_LENGTH, `Maksimalno ${COMPANY_NAME_MAX_LENGTH} znakova`),
  taxId: yup.string().required('Porezni broj je obavezan'),
  addressName: yup.string().required('Adresa je obavezna'),
  countryCode: yup.string().required('Država je obavezna'),
  addressPostalCode: yup.object().required('Poštanski broj je obavezan'),
  email: yup.string().email('Neispravan email').nullable().optional(),
});

export type ContractorFormData = yup.InferType<typeof contractorSchema>;
