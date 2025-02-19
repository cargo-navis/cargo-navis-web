import { backend } from '@/lib/services/backendService';

import type { PostalCode } from './postalCodes.d';

export async function searchPostalCodes(query: string, country: string) {
  return backend.get<PostalCode[]>('/api/postalCodes', { params: { query, country } });
}
