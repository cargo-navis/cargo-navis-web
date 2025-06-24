import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { LoadStatus, Shipment } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { useClients, useDrivers, useQueryParamState, useShipments } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import { ShipmentsFilter } from './ShipmentsFilter';
import { ShipmentsTable } from './ShipmentsTable';
import { ShipmentsTableLoader } from './ShipmentsTableLoader';
import { organizeSubshipments } from './utils';

export const ShipmentsPage = () => {
  const {
    value: selectedClientId,
    onChange: onClientChange,
    onClearAll,
  } = useQueryParamState({
    paramName: 'clientId',
  });
  const { value: selectedDriverId, onChange: onDriverChange } = useQueryParamState({
    paramName: 'driverId',
  });
  const { value: selectedLoadingStatus, onChange: onLoadingStatusChange } = useQueryParamState({
    paramName: 'loadStatus',
  });
  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      loadStatus: selectedLoadingStatus ? (selectedLoadingStatus as LoadStatus) : undefined,
    },
    select: organizeSubshipments,
  });

  const isEmpty = shipments?.length === 0;
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);

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
        <ShipmentsFilter
          selectedClientId={selectedClientId}
          selectedDriverId={selectedDriverId}
          selectedLoadingStatus={selectedLoadingStatus}
          onClearAll={onClearAll}
          onClientChange={onClientChange}
          onDriverChange={onDriverChange}
          onLoadingStatusChange={onLoadingStatusChange}
        />
      </Box>
      <Box className="py-5 isolate">
        {isLoading ? (
          <ShipmentsTableLoader />
        ) : isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/shipments/new"
            buttonText="Dodaj Nalog"
            description={
              selectedClientId || selectedDriverId
                ? `Nema naloga za ${selectedClientId ? `klijenta "${selectedClient?.name}"` : ''}${selectedClientId && selectedDriverId ? ' i ' : ''}${selectedDriverId ? `vozača "${selectedDriver?.firstName} ${selectedDriver?.lastName}"` : ''}.`
                : 'Kada dodate naloge, oni će se prikazati ovdje.'
            }
            title={
              selectedClientId || selectedDriverId
                ? '📄 Nema naloga za odabrane filtere.'
                : '📄 Još nema zapisa o nalozima.'
            }
          />
        ) : (
          <ShipmentsTable shipments={shipments} />
        )}
      </Box>
    </DashboardLayout>
  );
};
