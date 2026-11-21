/**
 * Nalozi (DECISIONS §5 „Nalozi”, labs /tables, /nalog, /routes, /invoice, /overlays/pagination|loading|empty): header
 * with „Učitaj nalog” + „Dodaj nalog”, page tabs Nalozi / Nalozi u pripremi (count of ready drafts, tab in the URL),
 * toolbar + chip row, the table, pages below. Page in the URL, page size remembered. A row click opens the quick look
 * sheet (desktop; phones open the nalog page).
 */

import { useRouter } from 'next/router';
import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDelayedFlag, useIsMobile, useScrollRestoration, useShipmentDrafts } from '@/lib/hooks';
import { useHasMounted } from '@/lib/hooks/dom';
import { Icon } from '@/ui';

import { DraftsTab } from './DraftsTab';
import {
  ACCEPTED_DRAFT_FILE_TYPES,
  usePaginationQueryParamState,
  useShipmentsPageData,
  useShipmentsPageTab,
  useUploadDraftFiles,
} from './hooks';
import { QuickLookSheet } from './list/QuickLookSheet';
import { ShipmentsFooter } from './list/ShipmentsFooter';
import { COLUMN_LABELS, ShipmentsTable, useColumnVisibility } from './list/ShipmentsTable';
import { type ActiveFilter, FilterChipRow, ShipmentsToolbar, useActiveFilters } from './list/Toolbar';
import { ShipmentsFiltersProvider, useShipmentsFiltersContext } from './providers/ShipmentsFiltersProvider';
import { NEW_SHIPMENT_HREF } from './shared/actions';
import { ShipmentLookupsProvider, useLookups, useShipmentLookups } from './shared/lookups';
import { ShipmentsDropZone } from './ShipmentsDropZone';

export const ShipmentsPage = () => {
  const isMounted = useHasMounted();
  const router = useRouter();
  const { tab, setTab } = useShipmentsPageTab();
  const { data: drafts = [] } = useShipmentDrafts();
  const lookups = useShipmentLookups();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadDraftFiles(() => setTab('drafts'));

  if (!isMounted) return null;

  const readyDraftsCount = drafts.filter((draft) => draft.status === 'EXTRACTED').length;
  const openFilePicker = () => fileInputRef.current?.click();

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length > 0) await uploadFiles(files);
  }

  return (
    <ShipmentsFiltersProvider>
      <ShipmentLookupsProvider value={lookups}>
        <DashboardLayout>
          <PageTitle title="Nalozi" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight">Nalozi</h1>
              <div className="flex gap-2">
                <input
                  accept={ACCEPTED_DRAFT_FILE_TYPES.join(',')}
                  className="hidden"
                  multiple
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFilesSelected}
                />
                <Button variant="outline" onClick={openFilePicker}>
                  <Icon data-icon="inline-start" icon="IconUpload" size="s" /> Učitaj nalog
                </Button>
                <Button onClick={() => void router.push(NEW_SHIPMENT_HREF)}>
                  <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj nalog
                </Button>
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
              <TabsList variant="line">
                <TabsTrigger value="shipments">Nalozi</TabsTrigger>
                <TabsTrigger value="drafts">
                  Nalozi u pripremi
                  {readyDraftsCount > 0 && (
                    <Badge className="min-w-4.5 justify-center tabular-nums" look="solid" size="sm" tone="brand">
                      {readyDraftsCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {tab === 'shipments' ? (
              <ShipmentsList onUpload={openFilePicker} />
            ) : (
              <DraftsTab onUpload={openFilePicker} />
            )}
          </div>
        </DashboardLayout>
        <ShipmentsDropZone onFilesAccepted={() => setTab('drafts')} />
      </ShipmentLookupsProvider>
    </ShipmentsFiltersProvider>
  );
};

function ShipmentsList({ onUpload }: { onUpload(): void }) {
  const router = useRouter();
  const { page, pageSize, setPage, setPageSize } = usePaginationQueryParamState();
  const { data, isError, isFetching, isPlaceholderData, refetch } = useShipmentsPageData();
  const { isLoading: isLookupsLoading } = useLookups();
  const { activeFiltersCount, clearAll } = useShipmentsFiltersContext();
  const activeFilters = useActiveFilters();
  const { visibility, update } = useColumnVisibility();
  const tableTopRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [quickLookId, setQuickLookId] = React.useState<string>();

  const shipments = data?.data ?? [];
  // The quick look follows the row (fresh after an assign / status change) and closes once the row is gone from the
  // list (another page, filters, sort, deleted). A filter change keeps the old rows until the new page arrives.
  const quickLook = quickLookId ? shipments.find((shipment) => shipment.id === quickLookId) : undefined;
  if (quickLookId && !quickLook) setQuickLookId(undefined);
  // No data yet (also while the request waits for the router or URL filters): skeleton, unless it failed.
  const isFirstLoad = !data && (!isError || isLookupsLoading);
  const showFetching = useDelayedFlag(isFetching && !isFirstLoad && (isPlaceholderData || !!data));
  useScrollRestoration('shipments', { isReady: !isFirstLoad && shipments.length > 0 });

  const total = data?.totalElements ?? 0;
  const pageCount = data?.totalPages ?? 1;

  // Past the last page (e.g. deleted the last row of the last page, or an old link): go to the last one that exists.
  const lastPage = Math.max(1, data?.totalPages ?? 1);
  React.useEffect(() => {
    if (data && !isPlaceholderData && !isFetching && page > lastPage) setPage(lastPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setPage is a new function every render
  }, [data, isPlaceholderData, isFetching, page, lastPage]);
  const currentPage = data?.currentPage ?? page;
  const firstResult = total ? (currentPage - 1) * (data?.pageSize ?? pageSize) + 1 : 0;
  const lastResult = Math.min(firstResult + shipments.length - 1, total);
  const resultsLabel =
    data && total > 0
      ? `Prikazano ${firstResult}–${lastResult} od ${total.toLocaleString('hr-HR')} rezultata`
      : undefined;

  // After a page change, start reading at the top of the table (below the app header).
  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount));
    const top = tableTopRef.current?.getBoundingClientRect().top;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-header-height')) || 0;
    const headerPx = header * parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (top !== undefined && top < headerPx) {
      window.scrollTo({ top: window.scrollY + top - headerPx - 16, behavior: 'smooth' });
    }
  }

  let empty: React.ReactNode = null;
  if (isError && !data) {
    empty = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="danger">
            <Icon icon="IconAlertOctagon" size="m" />
          </EmptyMedia>
          <EmptyTitle>Nalozi se nisu učitali</EmptyTitle>
          <EmptyDescription>Problem je kod nas, ne kod tebe. Pokušaj ponovno za koji trenutak.</EmptyDescription>
        </EmptyHeader>
        <Button loading={isFetching} variant="outline" onClick={() => void refetch()}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </Empty>
    );
  } else if (shipments.length === 0 && activeFiltersCount > 0) {
    empty = <FilteredEmpty filters={activeFilters} onClear={clearAll} />;
  } else if (shipments.length === 0) {
    empty = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="IconTruck" size="m" />
          </EmptyMedia>
          <EmptyTitle>Još nema naloga</EmptyTitle>
          <EmptyDescription>Dodaj prvi nalog ručno ili učitaj PDF od klijenta.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" onClick={onUpload}>
            <Icon data-icon="inline-start" icon="IconFileUpload" size="s" /> Učitaj nalog
          </Button>
          <Button onClick={() => void router.push(NEW_SHIPMENT_HREF)}>
            <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj nalog
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const state = isFirstLoad ? 'loading' : shipments.length === 0 ? 'empty' : 'data';

  return (
    <>
      <ShipmentsToolbar
        columns={Object.entries(COLUMN_LABELS).map(([id, label]) => ({
          id,
          label,
          visible: visibility[id] !== false,
          onToggle: (visible) => update(id, visible),
        }))}
      />
      <FilterChipRow filters={activeFilters} resultsLabel={resultsLabel} />
      <ShipmentsTable
        empty={empty}
        selectedId={isMobile ? undefined : quickLook?.id}
        shipments={shipments}
        showFetching={showFetching}
        state={state}
        tableTopRef={tableTopRef}
        visibility={visibility}
        onRowOpen={isMobile ? undefined : (shipment) => setQuickLookId(shipment.id)}
      />
      {state === 'data' && resultsLabel && (
        <ShipmentsFooter
          page={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          resultsLabel={resultsLabel}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      )}
      <QuickLookSheet shipment={isMobile ? undefined : quickLook} onClose={() => setQuickLookId(undefined)} />
    </>
  );
}

function FilteredEmpty({ filters, onClear }: { filters: ActiveFilter[]; onClear(): void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="IconSearch" size="m" />
        </EmptyMedia>
        <EmptyTitle>Nema naloga za odabrane filtere</EmptyTitle>
        <div className="flex flex-wrap justify-center gap-1.5">
          {filters.map((filter) => (
            <span
              className="inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium text-foreground/80"
              key={filter.key}
            >
              {filter.label}
            </span>
          ))}
        </div>
      </EmptyHeader>
      <Button variant="outline" onClick={onClear}>
        <Icon data-icon="inline-start" icon="IconFilterOff" size="s" /> Očisti filtere
      </Button>
    </Empty>
  );
}
