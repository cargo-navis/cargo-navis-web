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
  /** Some member states, Germany and Spain among them, confirm the id but withhold the details. */
  name: string | null;
  address: ViesCompanyAddress | null;
}

export interface ViesLookupParams {
  countryCode: string;
  number: string;
}
