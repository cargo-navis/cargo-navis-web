import { useRef } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import {
  useClients,
  useContractors,
  useCurrentTenant,
  useEmployees,
  useScrollRestoration,
  useShipmentDrafts,
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
import { DraftsTab } from './DraftsTab';
import {
  ACCEPTED_DRAFT_FILE_TYPES,
  usePaginationQueryParamState,
  useShipmentsPageData,
  useShipmentsPageTab,
  useUploadDraftFiles,
} from './hooks';
import { ShipmentsFiltersProvider } from './providers/ShipmentsFiltersProvider';
import { ShipmentFilters } from './ShipmentFilters';
import { ShipmentsDropZone } from './ShipmentsDropZone';
import { ShipmentsPageTabs } from './ShipmentsPageTabs';
import { ShipmentsTable } from './ShipmentsTable';

export const ShipmentsPage = () => {
  const isMounted = useHasMounted();
  const { tab, setTab } = useShipmentsPageTab();
  const { data: drafts = [] } = useShipmentDrafts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadDraftFiles(() => setTab('drafts'));

  if (!isMounted) return null;

  const readyDraftsCount = drafts.filter((d) => d.status === 'EXTRACTED').length;
  const isShipmentsTab = tab === 'shipments';

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    await uploadFiles(files);
  }

  return (
    <ShipmentsFiltersProvider>
      <DashboardLayout>
        <PageTitle title="Nalozi" />
        <Box>
          <FlexLayout className="items-center justify-between">
            <Heading as="h1" variant="text-xl">
              Nalozi
            </Heading>
            <FlexLayout className="items-center gap-2">
              <input
                accept={ACCEPTED_DRAFT_FILE_TYPES.join(',')}
                className="hidden"
                multiple
                ref={fileInputRef}
                type="file"
                onChange={handleFilesSelected}
              />
              <Button
                iconLeft="IconUpload"
                text="Učitaj nalog"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              />
              <Button href="/dashboard/shipments/new" iconLeft="IconPlus" text="Dodaj Nalog" />
            </FlexLayout>
          </FlexLayout>
          <ShipmentsPageTabs readyDraftsCount={readyDraftsCount} setTab={setTab} tab={tab} />
          {isShipmentsTab && <ShipmentFilters />}
        </Box>
        {isShipmentsTab ? <ShipmentPageContent /> : <DraftsTab />}
      </DashboardLayout>
      <ShipmentsDropZone onFilesAccepted={() => setTab('drafts')} />
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
