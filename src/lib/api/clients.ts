import { clients } from '@/lib/mocks/clients';
import { backend } from '@/lib/services/backendService';
import { sleep } from '@/lib/utils/async';
import type { Client, CreateClientParams } from './clients.d';

export async function getClients() {
  await sleep();

  return clients;
  // return backend.get<Client[]>('/api/clients');
}

export async function createClient(data: CreateClientParams) {
  return backend.post<Client>('/api/clients', data);
}
