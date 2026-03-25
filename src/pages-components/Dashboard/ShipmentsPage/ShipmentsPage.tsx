import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useClients,
  useContractors,
  useCurrentTenant,
  useEmployees,
  useScrollRestoration,
  useVehicles,
} from '@/lib/hooks';
import { useHasMounted } from '@/lib/hooks/dom';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import {
  BottomPaginationControls,
  EmptyShipmentsTableState,
  ShipmentsTableLoader,
  TopPaginationControls,
} from './components';
import { usePaginationQueryParamState, useShipmentsPageData } from './hooks';
import { ShipmentsFiltersProvider } from './providers/ShipmentsFiltersProvider';
import { ShipmentFilters } from './ShipmentFilters';
import { ShipmentsTable } from './ShipmentsTable';

export const ShipmentsPage = () => {
  const isMounted = useHasMounted();
  if (!isMounted) return null;

  return (
    <ShipmentsFiltersProvider>
      <DashboardLayout>
        <Box>
          <FlexLayout className="items-center justify-between">
            <Heading as="h1" variant="text-xl">
              Nalozi
            </Heading>
            <Button href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
          </FlexLayout>
          <ShipmentFilters />
        </Box>
        <ShipmentPageContent />
      </DashboardLayout>
    </ShipmentsFiltersProvider>
  );
};

const ShipmentPageContent = () => {
  const { pageSize, setPage, setPageSize } = usePaginationQueryParamState();
  const { data: response, isLoading: isShipmentsLoading } = useShipmentsPageData();
  const { isLoading: isClientsLoading } = useClients();
  const { isLoading: isContractorsLoading } = useContractors();
  const { isLoading: isTenantLoading } = useCurrentTenant();
  const { isLoading: isVehiclesLoading } = useVehicles();
  const { isLoading: isEmployeesLoading } = useEmployees();

  const isLoading =
    isShipmentsLoading ||
    isClientsLoading ||
    isContractorsLoading ||
    isTenantLoading ||
    isVehiclesLoading ||
    isEmployeesLoading;

  const shipments = response?.data ?? [];
  useScrollRestoration('shipments', { isReady: !isLoading && shipments.length > 0 });
  const paginationInfo = response
    ? {
        currentPage: response.currentPage,
        pageSize: response.pageSize,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }
    : null;

  const isEmpty = !shipments || shipments.length === 0;

  const shouldDisplayPagination = !isLoading && !isEmpty;

  return (
    <Box className="py-5">
      {/* Top pagination controls */}
      <DisplayIf condition={shouldDisplayPagination}>
        {!!paginationInfo && (
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
        <EmptyShipmentsTableState />
      ) : (
        <FlexLayout className="flex-col gap-4 isolate">
          <ShipmentsTable shipments={shipments} />
          {/* Bottom pagination controls */}
          <DisplayIf condition={shouldDisplayPagination}>
            {!!paginationInfo && (
              <BottomPaginationControls isLoading={isLoading} paginationInfo={paginationInfo} setPage={setPage} />
            )}
          </DisplayIf>
        </FlexLayout>
      )}
    </Box>
  );
};
