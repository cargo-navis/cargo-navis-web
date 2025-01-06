import { getCurrentUser } from '@/lib/api/user';
import { useQuery } from '@tanstack/react-query';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });
}
