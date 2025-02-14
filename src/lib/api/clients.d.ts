export interface Client {
  id: string;
  name: string;
  address: ClientAddress;
  vatNumber: string;
  nationalCompanyRegisterId: string;
}

interface ClientAddress {
  streetName: string;
  id: string;
  postalCode: string;
  region: string;
  city: string;
  countryCode: string;
}

export type CreateClientParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
};

export type UpdateClientParams = Partial<CreateClientParams>;
