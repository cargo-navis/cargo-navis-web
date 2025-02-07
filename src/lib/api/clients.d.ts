import type { Address } from './address.d';

export interface Client {
  id: string;
  name: string;
  address: Address;
  vatNumber: string;
  nationalCompanyRegisterId: string;
}

export type CreateClientParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  vatNumber: string;
  nationalCompanyRegisterId: string;
};
