export interface Tenant {
  id: string;
  name: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  communityLicenseId: string;
  cargoInsuranceExpiryDate: string;
  address: {
    placeName: string;
    postalCode: string;
  };
}

export type UpdateTenantParams = Omit<Tenant, 'id'>;
