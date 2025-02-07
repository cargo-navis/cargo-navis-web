import { clients } from '@/lib/mocks/clients';
import { sleep } from '@/lib/utils/async';

export async function getClients() {
  await sleep();

  return clients;
  // return backend.get<Client[]>('/api/clients');
}
