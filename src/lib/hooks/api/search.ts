import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { globalSearch } from '@/lib/api';

export const GLOBAL_SEARCH_MIN_LENGTH = 3;

export function useGlobalSearch(query: string) {
  const q = query.trim();

  return useQuery({
    queryKey: ['search', q],
    queryFn: ({ signal }) => globalSearch({ q }, signal),
    enabled: q.length >= GLOBAL_SEARCH_MIN_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
