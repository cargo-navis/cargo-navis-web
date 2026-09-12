import * as yup from 'yup';

export const tenantSchema = yup.object().shape({
  name: yup.string().required('Ime je obavezno'),
  taxId: yup.string().required('Porezni broj je obavezan'),
  communityLicenseId: yup.string(),
  cargoInsuranceExpiryDate: yup.string(),
  address: yup.object().shape({
    streetName: yup.string().required('Adresa je obavezna'),
    postalCode: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required('Poštanski broj je obavezan'),
    countryCode: yup.string().required('Država je obavezna'),
  }),
  shipmentFooter: yup.string().optional(),
  shipmentTransportTerms: yup.string().optional(),
});
