import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type Contractor,
  createContractor,
  deleteContractor,
  getContractors,
  updateContractor,
  type UpdateContractorParams,
} from '@/lib/api';

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

export function useContractor(id: string) {
  return useContractors({
    enabled: !!id,
    select: (contractors) => {
      return contractors.find((c) => c.id.toString() === id);
    },
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContractor,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['contractors'], type: 'all' });
    },
  });
}

export function useUpdateContractor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateContractorParams) => updateContractor(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['contractors'], type: 'all' });
    },
  });
}

export function useDeleteContractor(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteContractor(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['contractors'], type: 'all' });
    },
  });
}
