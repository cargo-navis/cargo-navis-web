import type { Tenant } from '@/lib/api/tenant.d';

import { fetchPostalCodeData } from '../../ShipmentsPage/NewShipmentPage/utils';

export interface TenantFormData {
  name: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  communityLicenseId?: string;
  cargoInsuranceExpiryDate?: string;
  shipmentFooter?: string;
  shipmentTransportTerms?: string;
  address: {
    streetName: string;
    postalCode: {
      value: string;
      label: string;
    };
    countryCode: string;
  };
}

export const getFormDefaultValues = (tenant: Tenant) => {
  return async () => {
    const postalCodeData = await fetchPostalCodeData(tenant?.address?.id || '');

    return {
      name: tenant?.name || '',
      vatNumber: tenant?.vatNumber || '',
      nationalCompanyRegisterId: tenant?.nationalCompanyRegisterId || '',
      communityLicenseId: tenant?.communityLicenseId || '',
      cargoInsuranceExpiryDate: tenant?.cargoInsuranceExpiryDate || '',
      address: {
        streetName: tenant?.address?.streetName || '',
        countryCode: tenant?.address?.countryCode || '',
        postalCode: {
          value: postalCodeData?.value || '',
          label: postalCodeData?.label || '',
        },
      },
      shipmentFooter: tenant?.shipmentFooter || '',
      shipmentTransportTerms: tenant?.shipmentTransportTerms || '',
    };
  };
};
