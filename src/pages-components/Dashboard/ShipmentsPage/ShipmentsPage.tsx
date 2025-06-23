import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { useClients, useQueryParamState, useShipments } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import { ShipmentsFilter } from './ShipmentsFilter';
import { ShipmentsTable } from './ShipmentsTable';
import { ShipmentsTableLoader } from './ShipmentsTableLoader';
import { organizeSubshipments } from './utils';

export const ShipmentsPage = () => {
  const { value: selectedClientId, onChange: onClientChange } = useQueryParamState({
    paramName: 'clientId',
  });
  const { data: clients = [] } = useClients();
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    params: { clientId: selectedClientId ? String(selectedClientId) : undefined },
    select: organizeSubshipments,
  });

  const isEmpty = shipments?.length === 0;
  const selectedClient = clients.find((client) => client.id === selectedClientId);

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="items-center justify-between">
          <Heading as="h1" variant="text-xl">
            Nalozi
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Button href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
          </DisplayIf>
        </FlexLayout>
        <ShipmentsFilter selectedClientId={selectedClientId} onClientChange={onClientChange} />
      </Box>
      <Box className="py-5 isolate">
        {isLoading ? (
          <ShipmentsTableLoader />
        ) : isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/shipments/new"
            buttonText="Dodaj Nalog"
            description={
              selectedClientId
                ? `Nema naloga za klijenta "${selectedClient?.name}".`
                : 'Kada dodate naloge, oni će se prikazati ovdje.'
            }
            title={selectedClientId ? '📄 Nema naloga za odabranog klijenta.' : '📄 Još nema zapisa o nalozima.'}
          />
        ) : (
          <ShipmentsTable shipments={shipments} />
        )}
      </Box>
    </DashboardLayout>
  );
};
