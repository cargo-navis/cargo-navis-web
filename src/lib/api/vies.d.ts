export interface ViesCompanyAddress {
  countryCode: string;
  placeName: string;
  postalCode: string;
  postalCodeId: string;
  raw: string;
  streetName: string;
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
