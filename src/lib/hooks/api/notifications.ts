import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getNotifications, type Notification, readAllNotifications, readNotification } from '@/lib/api';

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

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => readNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useReadAllNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => readAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
