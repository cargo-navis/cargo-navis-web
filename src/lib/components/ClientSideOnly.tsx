import { useHasMounted } from '@/lib/hooks/dom';

export const ClientSideOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasMounted = useHasMounted();

  return hasMounted ? <>{children}</> : null;
};
