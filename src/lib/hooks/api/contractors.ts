import { useQuery } from '@tanstack/react-query';

import { type Contractor, getContractors } from '@/lib/api';

interface UseContractorsArgs<T> {
  select?: (data: Contractor[]) => T;
  enabled?: boolean;
}

export function useContractors<TData = Contractor[]>(args?: UseContractorsArgs<TData>) {
  return useQuery<Contractor[], unknown, TData>({
    queryKey: ['contractors'],
    queryFn: getContractors,
    ...args,
  });
}
