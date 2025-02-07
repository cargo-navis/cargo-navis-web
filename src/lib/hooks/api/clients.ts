import { type Client, getClients } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useClients<TData = Client[]>() {
  return useQuery<Client[], unknown, TData>({
    queryKey: ['clients'],
    queryFn: getClients,
  });
}
