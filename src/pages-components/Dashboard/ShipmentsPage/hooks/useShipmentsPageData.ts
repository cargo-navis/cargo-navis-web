import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useShipments } from '@/lib/hooks';

import { usePaginationQueryParamState, useShipmentsSortLocalStorage } from '../hooks';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export function useShipmentsPageData() {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedLoadStatus,
    selectedInvoiceStatus,
    selectedIsInvoiceOverdue,
    loadingReadyDateFrom,
    loadingReadyDateTo,
    unloadingDueDateFrom,
    unloadingDueDateTo,
  } = useShipmentsFiltersContext();
  const { page, pageSize, isRouterReady: isPaginationReady } = usePaginationQueryParamState();
  const { sort, isRouterReady: isSortReady } = useShipmentsSortLocalStorage();

  const isRouterReady = isPaginationReady && isSortReady;

  return useShipments({
    params: {
      clientId: selectedClientId ? String(selectedClientId) : undefined,
      driverId: selectedDriverId ? String(selectedDriverId) : undefined,
      dispatcherId: selectedDispatcherId ? String(selectedDispatcherId) : undefined,
      loadStatus: selectedLoadStatus ? (selectedLoadStatus as LoadStatus) : undefined,
      invoiceStatus: selectedInvoiceStatus ? (selectedInvoiceStatus as InvoiceStatus) : undefined,
      isInvoiceOverdue: selectedIsInvoiceOverdue ? String(selectedIsInvoiceOverdue) : undefined,
      loadingReadyDateFrom: loadingReadyDateFrom ? String(loadingReadyDateFrom) : undefined,
      loadingReadyDateTo: loadingReadyDateTo ? String(loadingReadyDateTo) : undefined,
      unloadingDueDateFrom: unloadingDueDateFrom ? String(unloadingDueDateFrom) : undefined,
      unloadingDueDateTo: unloadingDueDateTo ? String(unloadingDueDateTo) : undefined,
      page: page,
      size: pageSize,
      sort: sort || undefined,
    },
    enabled: isRouterReady,
  });
}
