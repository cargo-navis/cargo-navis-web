export interface Contractor {
  id: string;
  name: string;
  address: ContractorAddress;
  taxId: string;
  termsOfPayment: string;
  email?: string;
}

interface ContractorAddress {
  streetName: string;
  postalCodeId: string;
  postalCode: string;
  placeName: string;
  countryCode: string;
}

export type CreateContractorParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  taxId: string;
  /** Days; the forms send a number (0 = none). */
  termsOfPayment: string | number;
  email?: string;
};

export type UpdateContractorParams = Partial<CreateContractorParams>;
