import { backend } from '@/lib/services/backendService';
import type { Client, CreateClientParams } from './clients.d';

export async function getClients() {
  return backend.get<Client[]>('/api/clients');
}

export async function createClient(data: CreateClientParams) {
  return backend.post<Client>('/api/clients', data);
}

export async function deleteClient(id: string) {
  return backend.delete(`/api/clients/${id}`);
}