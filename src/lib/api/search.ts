import { backend } from '@/lib/services/backendService';

import type { GlobalSearchParams, GlobalSearchResults } from './search.d';

export async function globalSearch(params: GlobalSearchParams, signal?: AbortSignal) {
  return backend.get<GlobalSearchResults>('/api/search', { params, signal });
}
