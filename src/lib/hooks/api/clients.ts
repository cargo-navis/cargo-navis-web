import { type Client, createClient, getClients } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useClients<TData = Client[]>() {
  return useQuery<Client[], unknown, TData>({
    queryKey: ['clients'],
    queryFn: getClients,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['clients'], type: 'all' });
    },
  });
}
