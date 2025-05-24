import * as yup from 'yup';

export const tenantSchema = yup.object().shape({
  name: yup.string().required('Ime je obavezno'),
  vatNumber: yup.string().required('VAT je obavezan'),
  nationalCompanyRegisterId: yup.string().required('OIB je obavezan'),
  communityLicenseId: yup.string().required('Broj licence je obavezan'),
  cargoInsuranceExpiryDate: yup.string().required('Datum isteka osiguranja je obavezan'),
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
});
