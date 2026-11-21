import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type Client, getClients, updateClient, type UpdateClientParams } from '@/lib/api';

interface UseClientsArgs<T> {
  select?: (data: Client[]) => T;
  enabled?: boolean;
}

export function useClients<TData = Client[]>(args?: UseClientsArgs<TData>) {
  return useQuery<Client[], unknown, TData>({
    queryKey: ['clients'],
    queryFn: getClients,
    ...args,
    select: args?.select,
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientParams) => updateClient(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['clients'], type: 'all' });
    },
  });
}
