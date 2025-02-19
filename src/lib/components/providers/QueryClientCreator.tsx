import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef } from 'react';

const config: QueryClientConfig = {};

export const QueryClientCreator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useRef<QueryClient>();
  if (!queryClient.current) {
    queryClient.current = new QueryClient(config);
  }

  return (
    <QueryClientProvider client={queryClient.current}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
};
