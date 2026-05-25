import { useClient } from '@/lib/hooks';
import { Text, type TextProps } from '@/ui';

interface ClientNameProps extends Omit<TextProps, 'children'> {
  id?: string | null;
}

export const ClientName = ({ id, ...textProps }: ClientNameProps) => {
  const { data: client } = useClient(id ?? '');
  if (!client?.name) return null;

  return <Text {...textProps}>{client.name}</Text>;
};
