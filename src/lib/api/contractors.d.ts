export interface Contractor {
  id: string;
  name: string;
  address: ContractorAddress;
  vatNumber: string;
  nationalCompanyRegisterId: string;
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
  vatNumber: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
  email?: string;
};

export type UpdateContractorParams = Partial<CreateContractorParams>;
