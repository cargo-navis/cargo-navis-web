import * as yup from 'yup';

export const clientSchema = yup.object().shape({
  name: yup.string().required('Ime je obavezno'),
  taxId: yup.string().required('Porezni broj je obavezan'),
  nationalCompanyRegisterId: yup.string().required('OIB je obavezan'),
  addressName: yup.string().required('Adresa je obavezna'),
  countryCode: yup.string().required('Država je obavezna'),
  addressPostalCode: yup.object().required('Poštanski broj je obavezan'),
  email: yup.string().email('Neispravan email').nullable().optional(),
});

export type ClientFormData = yup.InferType<typeof clientSchema>;
