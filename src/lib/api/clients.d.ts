export interface Client {
  id: string;
  name: string;
  address: ClientAddress;
  taxId: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
  email?: string;
}

interface ClientAddress {
  streetName: string;
  postalCodeId: string;
  postalCode: string;
  placeName: string;
  countryCode: string;
}

export type CreateClientParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  taxId: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
  email?: string;
};

export type UpdateClientParams = Partial<CreateClientParams>;
