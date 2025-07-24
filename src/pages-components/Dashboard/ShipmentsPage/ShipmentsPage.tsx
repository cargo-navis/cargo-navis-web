import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { InvoiceStatus, LoadStatus } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { useQueryParamState, useShipments } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import { BottomPaginationControls, TopPaginationControls } from './components';
import { usePaginationQueryParamState } from './hooks';
import { ShipmentFilters } from './ShipmentFilters';
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
  const { value: loadingDateFrom, onChange: onLoadingDateFromChange } = useQueryParamState({
    paramName: 'loadingDateFrom',
  });
  const { value: loadingDateTo, onChange: onLoadingDateToChange } = useQueryParamState({
    paramName: 'loadingDateTo',
  });
  const { value: unloadingDateFrom, onChange: onUnloadingDateFromChange } = useQueryParamState({
    paramName: 'unloadingDateFrom',
  });
  const { value: unloadingDateTo, onChange: onUnloadingDateToChange } = useQueryParamState({
    paramName: 'unloadingDateTo',
  });

  // Pagination state
  const { page, pageSize, setPage, setPageSize, isRouterReady } = usePaginationQueryParamState();

  const { data: response, isLoading } = useShipments({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      loadStatus: selectedLoadingStatus ? (selectedLoadingStatus as LoadStatus) : undefined,
      invoiceStatus: selectedInvoiceStatus ? (selectedInvoiceStatus as InvoiceStatus) : undefined,
      loadingDateFrom: loadingDateFrom ? String(loadingDateFrom) : undefined,
      loadingDateTo: loadingDateTo ? String(loadingDateTo) : undefined,
      unloadingDateFrom: unloadingDateFrom ? String(unloadingDateFrom) : undefined,
      unloadingDateTo: unloadingDateTo ? String(unloadingDateTo) : undefined,
      page: page,
      size: pageSize,
    },
    enabled: isRouterReady,
  });

  // Get organized shipments and pagination info
  const shipments = response ? organizeSubshipments(response.data) : [];
  const paginationInfo = response
    ? {
        currentPage: response.currentPage,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }
    : null;

  const isEmpty = !shipments || shipments.length === 0;

  const hasActiveFilters =
    selectedClientId ||
    selectedDriverId ||
    selectedLoadingStatus ||
    selectedInvoiceStatus ||
    loadingDateFrom ||
    loadingDateTo ||
    unloadingDateFrom ||
    unloadingDateTo;

  const shouldDisplayPagination = !isLoading && !isEmpty;

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
        <ShipmentFilters
          loadingDateFrom={String(loadingDateFrom || '')}
          loadingDateTo={String(loadingDateTo || '')}
          selectedClientId={selectedClientId}
          selectedDriverId={selectedDriverId}
          selectedInvoiceStatus={selectedInvoiceStatus}
          selectedLoadingStatus={selectedLoadingStatus}
          unloadingDateFrom={String(unloadingDateFrom || '')}
          unloadingDateTo={String(unloadingDateTo || '')}
          onClearAll={onClearAll}
          onClientChange={onClientChange}
          onDriverChange={onDriverChange}
          onInvoiceStatusChange={onInvoiceStatusChange}
          onLoadingDateFromChange={onLoadingDateFromChange}
          onLoadingDateToChange={onLoadingDateToChange}
          onLoadingStatusChange={onLoadingStatusChange}
          onUnloadingDateFromChange={onUnloadingDateFromChange}
          onUnloadingDateToChange={onUnloadingDateToChange}
        />
      </Box>
      <Box className="py-5">
        {/* Top pagination controls */}
        <DisplayIf condition={shouldDisplayPagination}>
          {!!paginationInfo && paginationInfo.totalPages > 1 && (
            <TopPaginationControls
              isLoading={isLoading}
              pageSize={pageSize}
              paginationInfo={paginationInfo}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          )}
        </DisplayIf>

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
          <FlexLayout className="flex-col gap-4 isolate">
            <ShipmentsTable shipments={shipments} />
            {/* Bottom pagination controls */}
            <DisplayIf condition={shouldDisplayPagination}>
              {!!paginationInfo && paginationInfo.totalPages > 1 && (
                <BottomPaginationControls isLoading={isLoading} paginationInfo={paginationInfo} setPage={setPage} />
              )}
            </DisplayIf>
          </FlexLayout>
        )}
      </Box>
    </DashboardLayout>
  );
};
