export interface Contractor {
  id: string;
  name: string;
  address: ContractorAddress;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
}

interface ContractorAddress {
  streetName: string;
  id: string;
  postalCode: string;
  region: string;
  city: string;
  countryCode: string;
}

export type CreateContractorParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
};

export type UpdateContractorParams = Partial<CreateContractorParams>;
