import type { Address } from './address.d';

export interface Client {
  id: string;
  name: string;
  address: Address;
  vatNumber: string;
  nationalCompanyRegisterId: string;
}
