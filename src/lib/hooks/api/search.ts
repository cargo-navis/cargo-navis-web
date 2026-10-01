import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { globalSearch, type GlobalSearchParams } from '@/lib/api';

export const GLOBAL_SEARCH_MIN_LENGTH = 3;

export function useGlobalSearch(query: string, options?: Omit<GlobalSearchParams, 'q'>) {
  const q = query.trim();

  return useQuery({
    queryKey: ['search', q, options],
    queryFn: ({ signal }) => globalSearch({ q, ...options }, signal),
    enabled: q.length >= GLOBAL_SEARCH_MIN_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
