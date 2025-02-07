import { backend } from '@/lib/services/backendService';
import type { Client } from './clients.d';

export async function getClients() {
  return backend.get<Client[]>('/api/clients');
}
