import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
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
    </QueryClientProvider>
  );
};
