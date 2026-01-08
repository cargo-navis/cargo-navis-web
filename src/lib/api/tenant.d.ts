export interface Tenant {
  id: string;
  name: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  communityLicenseId: string;
  cargoInsuranceExpiryDate: string;
  shipmentFooter?: string;
  shipmentTransportTerms?: string;
  address: {
    id: string;
    streetName: string;
    postalCode: string;
    placeName: string;
    countryCode: string;
  };
  logo?: {
    id: string;
    createdAt: string;
    name: string;
    mimeType: string;
    status: string;
    publicUrl: string;
  };
}

export type UpdateTenantParams = Omit<Tenant, 'id', 'address'> & {
  address: { streeName: string; postalCodeId: string };
};
