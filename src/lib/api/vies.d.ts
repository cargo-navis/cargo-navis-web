export interface ViesCompanyAddress {
  raw: string;
}

export interface ViesCompany {
  taxId: string;
  name: string;
  address: ViesCompanyAddress;
}

export interface ViesLookupParams {
  countryCode: string;
  number: string;
}
