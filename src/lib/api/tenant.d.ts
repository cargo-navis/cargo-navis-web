import type { Address } from './address.d';

export interface Tenant {
  name: string;
  address: Address;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  communityLicenseId: string;
  cargoInsuranceExpiryDate: string;
}
