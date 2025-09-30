import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useShipments } from '@/lib/hooks';

import { usePaginationQueryParamState } from '../hooks';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export function useShipmentsPageData() {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedLoadingStatus,
    selectedInvoiceStatus,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
  } = useShipmentsFiltersContext();
  const { page, pageSize, isRouterReady } = usePaginationQueryParamState();

  return useShipments({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      dispatcherId: selectedDispatcherId ? String(selectedDispatcherId) : undefined,
      loadStatus: selectedLoadingStatus ? (selectedLoadingStatus as LoadStatus) : undefined,
      invoiceStatus: selectedInvoiceStatus ? (selectedInvoiceStatus as InvoiceStatus) : undefined,
      loadingDateFrom: loadingDateFrom ? String(loadingDateFrom) : undefined,
      loadingDateTo: loadingDateTo ? String(loadingDateTo) : undefined,
      unloadingDateFrom: unloadingDateFrom ? String(unloadingDateFrom) : undefined,
      unloadingDateTo: unloadingDateTo ? String(unloadingDateTo) : undefined,
      page: page,
      size: pageSize,
      sort: 'createdAt,desc',
    },
    enabled: isRouterReady,
  });
}
