import * as yup from 'yup';

import type { Tenant } from '@/lib/api/tenant.d';

export interface TenantFormData {
  name: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  communityLicenseId: string;
  cargoInsuranceExpiryDate: string;
  termsOfPayment: string;
  address: {
    placeName: string;
    postalCode: string;
  };
}

export const tenantSchema = yup.object().shape({
  name: yup.string().required('Ime je obavezno'),
  vatNumber: yup.string().required('VAT je obavezan'),
  nationalCompanyRegisterId: yup.string().required('OIB je obavezan'),
  communityLicenseId: yup.string().required('Broj licence je obavezan'),
  cargoInsuranceExpiryDate: yup.string().required('Datum isteka osiguranja je obavezan'),
  termsOfPayment: yup.string().required('Valuta plaćanja je obavezna'),
  address: yup.object().shape({
    placeName: yup.string().required('Mjesto je obavezno'),
    postalCode: yup.string().required('Poštanski broj je obavezan'),
  }),
});

export const getFormDefaultValues = (tenant: Tenant): TenantFormData => ({
  name: tenant?.name || '',
  vatNumber: tenant?.vatNumber || '',
  nationalCompanyRegisterId: tenant?.nationalCompanyRegisterId || '',
  communityLicenseId: tenant?.communityLicenseId || '',
  cargoInsuranceExpiryDate: tenant?.cargoInsuranceExpiryDate || '',
  termsOfPayment: tenant?.termsOfPayment || '',
  address: {
    placeName: tenant?.address?.placeName || '',
    postalCode: tenant?.address?.postalCode || '',
  },
});
