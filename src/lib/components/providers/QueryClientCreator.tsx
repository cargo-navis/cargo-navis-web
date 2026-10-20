import { useMediaQuery } from '@mantine/hooks';
import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef } from 'react';

import { NotificationListener } from '../NotificationListener';

const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 30 * 1000,
    },
  },
};

export const QueryClientCreator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useRef<QueryClient>();
  // Devtools' floating button covers bottom-anchored mobile UI (e.g. the driver portal tab bar); md and up only.
  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (!queryClient.current) {
    queryClient.current = new QueryClient(config);
  }

  return (
    <QueryClientProvider client={queryClient.current}>
      <NotificationListener />
      {children}
      {isDesktop && <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} position="bottom" />}
    </QueryClientProvider>
  );
};
