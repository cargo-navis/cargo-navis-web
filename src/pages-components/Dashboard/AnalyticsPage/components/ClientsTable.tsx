import { ClientAnalyticsItem } from '@/lib/api';
import { useClient } from '@/lib/hooks/api';
import { formatEur } from '@/lib/utils/analytics';
import { FlexLayout, Text } from '@/ui';

import { TOP_N } from '../utils';
import { AnalyticsCard, EmptyTableState, TableHeader, TableRow } from './AnalyticsCard';

interface ClientRowProps {
  client: ClientAnalyticsItem;
  index: number;
}

const ClientRow = ({ client, index }: ClientRowProps) => {
  const { data: clientData } = useClient(client.clientId);
  const displayName = clientData?.name || '—';

  return (
    <TableRow index={index}>
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {client.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {formatEur(client.totalPrice)}
      </Text>
    </TableRow>
  );
};

interface ClientsTableProps {
  data: ClientAnalyticsItem[];
}

export const ClientsTable = ({ data }: ClientsTableProps) => (
  <AnalyticsCard title={`Top ${TOP_N} klijenata`}>
    <TableHeader>
      <Text className="flex-1" color="text-color-2" variant="text-s-medium">
        Klijent
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-2" variant="text-s-medium">
        Br. naloga
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-2" variant="text-s-medium">
        Ukupni prihod
      </Text>
    </TableHeader>

    <FlexLayout className="flex-col">
      {data.length === 0 ? (
        <EmptyTableState text="Nema podataka za odabrano razdoblje." />
      ) : (
        data.map((client, index) => <ClientRow client={client} index={index} key={client.clientId} />)
      )}
    </FlexLayout>
  </AnalyticsCard>
);
