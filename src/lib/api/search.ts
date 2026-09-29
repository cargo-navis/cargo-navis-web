import { backend } from '@/lib/services/backendService';

import type { GlobalSearchParams, GlobalSearchResults } from './search.d';

export enum SearchTypeEnum {
  SHIPMENTS = 'SHIPMENTS',
  FLEET = 'FLEET',
  EMPLOYEES = 'EMPLOYEES',
  CLIENTS = 'CLIENTS',
  CONTRACTORS = 'CONTRACTORS',
}

export async function globalSearch({ types, ...params }: GlobalSearchParams, signal?: AbortSignal) {
  return backend.get<GlobalSearchResults>('/api/search', {
    // Backend expects a comma-separated list (types=EMPLOYEES,CLIENTS), not axios' default types[]=... format
    params: { ...params, types: types?.length ? types.join(',') : undefined },
    signal,
  });
}
