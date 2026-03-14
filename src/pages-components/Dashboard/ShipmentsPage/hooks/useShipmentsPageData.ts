import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useShipments } from '@/lib/hooks';

import { usePaginationQueryParamState, useShipmentsSortLocalStorage } from '../hooks';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export function useShipmentsPageData() {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedLoadingStatus,
    selectedInvoiceStatus,
    selectedIsInvoiceOverdue,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
  } = useShipmentsFiltersContext();
  const { page, pageSize, isRouterReady: isPaginationReady } = usePaginationQueryParamState();
  const { sort, isRouterReady: isSortReady } = useShipmentsSortLocalStorage();

  const isRouterReady = isPaginationReady && isSortReady;

  return useShipments({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      dispatcherId: selectedDispatcherId ? String(selectedDispatcherId) : undefined,
      loadStatus: selectedLoadingStatus ? (selectedLoadingStatus as LoadStatus) : undefined,
      invoiceStatus: selectedInvoiceStatus ? (selectedInvoiceStatus as InvoiceStatus) : undefined,
      isInvoiceOverdue: selectedIsInvoiceOverdue ? String(selectedIsInvoiceOverdue) : undefined,
      loadingDateFrom: loadingDateFrom ? String(loadingDateFrom) : undefined,
      loadingDateTo: loadingDateTo ? String(loadingDateTo) : undefined,
      unloadingDateFrom: unloadingDateFrom ? String(unloadingDateFrom) : undefined,
      unloadingDateTo: unloadingDateTo ? String(unloadingDateTo) : undefined,
      page: page,
      size: pageSize,
      sort: sort || undefined,
    },
    enabled: isRouterReady,
  });
}
