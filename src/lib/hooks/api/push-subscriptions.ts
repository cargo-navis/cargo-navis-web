import { useQuery } from '@tanstack/react-query';

import { getPushSubscriptions } from '@/lib/api';

export function usePushSubscriptions() {
  return useQuery({
    queryKey: ['push-subscriptions'],
    queryFn: getPushSubscriptions,
  });
}
