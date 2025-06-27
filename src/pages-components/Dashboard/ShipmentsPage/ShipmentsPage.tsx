import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { InvoiceStatus, LoadStatus, Shipment } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { useQueryParamState, useShipments } from '@/lib/hooks';
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
  const { value: selectedInvoiceStatus, onChange: onInvoiceStatusChange } = useQueryParamState({
    paramName: 'invoiceStatus',
  });
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      loadStatus: selectedLoadingStatus ? (selectedLoadingStatus as LoadStatus) : undefined,
      invoiceStatus: selectedInvoiceStatus ? (selectedInvoiceStatus as InvoiceStatus) : undefined,
    },
    select: organizeSubshipments,
  });

  const isEmpty = shipments?.length === 0;

  const hasActiveFilters = selectedClientId || selectedDriverId || selectedLoadingStatus || selectedInvoiceStatus;

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
          selectedInvoiceStatus={selectedInvoiceStatus}
          selectedLoadingStatus={selectedLoadingStatus}
          onClearAll={onClearAll}
          onClientChange={onClientChange}
          onDriverChange={onDriverChange}
          onInvoiceStatusChange={onInvoiceStatusChange}
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
              hasActiveFilters ? 'Nema naloga za odabrane filtere.' : 'Kada dodate naloge, oni će se prikazati ovdje.'
            }
            title={hasActiveFilters ? '📄 Nema naloga za odabrane filtere.' : '📄 Još nema zapisa o nalozima.'}
          />
        ) : (
          <ShipmentsTable shipments={shipments} />
        )}
      </Box>
    </DashboardLayout>
  );
};
