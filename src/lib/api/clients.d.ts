export interface Client {
  id: string;
  name: string;
  address: ClientAddress;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
}

interface ClientAddress {
  streetName: string;
  id: string;
  postalCode: string;
  placeName: string;
  countryCode: string;
}

export type CreateClientParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
  termsOfPayment: string;
};

export type UpdateClientParams = Partial<CreateClientParams>;
