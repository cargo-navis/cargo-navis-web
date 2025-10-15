import { backend } from '@/lib/services/backendService';

import type { Client, CreateClientParams, UpdateClientParams } from './clients.d';

export async function getClients() {
  const clients = await backend.get<Client[]>('/api/clients');
  return clients.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createClient(data: CreateClientParams) {
  return backend.post<Client>('/api/clients', data);
}

export async function updateClient(id: string, data: UpdateClientParams) {
  return backend.put<Client>(`/api/clients/${id}`, data);
}

export async function deleteClient(id: string) {
  return backend.delete(`/api/clients/${id}`);
}
