import { keepPreviousData } from '@tanstack/react-query';

import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useShipments } from '@/lib/hooks';

import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';
import { DATE_FILTER_SORT, readDateFilter } from '../shared/dateFilter';
import { usePaginationQueryParamState } from './usePaginationQueryParamState';
import { useShipmentsSortLocalStorage } from './useShipmentsSortLocalStorage';

/** The current page of the list (filters, sort, page, size). A change keeps the previous rows until it answers. */
export function useShipmentsPageData() {
  const { filters, isApplyingUrlFilters } = useShipmentsFiltersContext();
  const { page, pageSize, isRouterReady: isPaginationReady } = usePaginationQueryParamState();
  const { sort, isRouterReady: isSortReady } = useShipmentsSortLocalStorage();
  const dateFilter = readDateFilter(filters);

  return useShipments({
    params: {
      clientId: filters.clientId,
      driverId: filters.driverId,
      dispatcherId: filters.dispatcherId,
      loadStatus: filters.loadStatus as LoadStatus | undefined,
      invoiceStatus: filters.invoiceStatus as InvoiceStatus | undefined,
      isInvoiceOverdue: filters.isInvoiceOverdue,
      // Left out entirely when unset, which is what returns both types.
      isAgency: filters.isAgency ? filters.isAgency === 'true' : undefined,
      activityDateFrom: filters.activityDateFrom,
      activityDateTo: filters.activityDateTo,
      loadingReadyDateFrom: filters.loadingReadyDateFrom,
      loadingReadyDateTo: filters.loadingReadyDateTo,
      unloadingDueDateFrom: filters.unloadingDueDateFrom,
      unloadingDueDateTo: filters.unloadingDueDateTo,
      page,
      size: pageSize,
      // No sort picked + a date range: by date, earliest first („Po datumu” in the sort select).
      sort: sort || (dateFilter ? DATE_FILTER_SORT[dateFilter.type] : undefined),
    },
    enabled: isPaginationReady && isSortReady && !isApplyingUrlFilters,
    placeholderData: keepPreviousData,
  });
}
