import Link from 'next/link';

import { Client, Tenant } from '@/lib/api';
import { useClient, useCurrentTenant } from '@/lib/hooks';
import { FlexLayout, Text } from '@/ui';

export const ClientItem: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: client } = useClient(clientId);
  const { data: tenant } = useCurrentTenant();

  let clientToRender: Client | Tenant | undefined = client;
  let href = client?.id ? `/dashboard/clients/${client?.id}` : '#';

  const isTenant = !client && tenant?.id === clientId;

  if (isTenant) {
    clientToRender = tenant;
    href = `/dashboard/tenant`;
  }

  return (
    <FlexLayout className="flex-col">
      <Text color="text-color-3" variant="text-s-medium">
        Klijent
      </Text>
      <Link className="hover:text-teal-500 transition-colors max-w-max" href={href}>
        <Text variant="text-l">{clientToRender?.name || '—'}</Text>
      </Link>
    </FlexLayout>
  );
};
