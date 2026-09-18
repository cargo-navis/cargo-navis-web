import type { PostalCode } from '@/lib/api/postalCodes.d';

/** Values a new client or contractor form can start from, e.g. what the VIES lookup returned. */
export interface CompanyFormInitialValues {
  name?: string;
  taxId?: string;
  addressName?: string;
  countryCode?: string;
  postalCode?: PostalCode;
}
