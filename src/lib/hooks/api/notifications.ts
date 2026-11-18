import { useQuery } from '@tanstack/react-query';

import { getNotifications, type Notification } from '@/lib/api';

interface UseNotificationsArgs<T> {
  select?: (data: Notification[]) => T;
  enabled?: boolean;
}

export function useNotifications<TData = Notification[]>(args?: UseNotificationsArgs<TData>) {
  return useQuery<Notification[], unknown, TData>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    ...args,
  });
}
