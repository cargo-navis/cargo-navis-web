import { useRouter } from 'next/router';
import { createContext, useCallback, useContext } from 'react';

import { SelectValue } from '@/ui';

import {
  ShipmentsFiltersStorageProvider,
  useShipmentsFiltersLocalStorage,
} from '../hooks/useShipmentsFiltersLocalStorage';
import { useFiltersLocalStorageState } from '../ShipmentFilters/useFiltersLocalStorageState';

export type ShipmentsFiltersContextType = {
  activeFiltersCount: number;
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  selectedDispatcherId: SelectValue;
  selectedLoadStatus: SelectValue;
  selectedInvoiceStatus: SelectValue;
  selectedIsInvoiceOverdue: SelectValue;
  loadingReadyDateFrom: string;
  loadingReadyDateTo: string;
  unloadingDueDateFrom: string;
  unloadingDueDateTo: string;
  onClientChange(clientId: SelectValue): void;
  onDriverChange(driverId: SelectValue): void;
  onDispatcherChange(dispatcherId: SelectValue): void;
  onLoadStatusChange(loadStatus: SelectValue): void;
  onInvoiceStatusChange(invoiceStatus: SelectValue): void;
  onIsInvoiceOverdueChange(isInvoiceOverdue: SelectValue): void;
  onLoadingReadyDateFromChange(date: string): void;
  onLoadingReadyDateToChange(date: string): void;
  onUnloadingDueDateFromChange(date: string): void;
  onUnloadingDueDateToChange(date: string): void;
  onClearAll(): void;
};

const ShipmentsFiltersContext = createContext<ShipmentsFiltersContextType | undefined>(undefined);

const ShipmentsFiltersProviderInner = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { clearAll: clearAllFilters } = useShipmentsFiltersLocalStorage();

  const { value: selectedClientId, onChange: onClientChange } = useFiltersLocalStorageState({
    paramName: 'clientId',
  });
  const { value: selectedDriverId, onChange: onDriverChange } = useFiltersLocalStorageState({
    paramName: 'driverId',
  });
  const { value: selectedDispatcherId, onChange: onDispatcherChange } = useFiltersLocalStorageState({
    paramName: 'dispatcherId',
  });
  const { value: selectedLoadStatus, onChange: onLoadStatusChange } = useFiltersLocalStorageState({
    paramName: 'loadStatus',
  });
  const { value: selectedInvoiceStatus, onChange: onInvoiceStatusChange } = useFiltersLocalStorageState({
    paramName: 'invoiceStatus',
  });
  const { value: selectedIsInvoiceOverdue, onChange: onIsInvoiceOverdueChange } = useFiltersLocalStorageState({
    paramName: 'isInvoiceOverdue',
  });
  const { value: loadingReadyDateFrom, onChange: onLoadingReadyDateFromChange } = useFiltersLocalStorageState({
    paramName: 'loadingReadyDateFrom',
  });
  const { value: loadingReadyDateTo, onChange: onLoadingReadyDateToChange } = useFiltersLocalStorageState({
    paramName: 'loadingReadyDateTo',
  });
  const { value: unloadingDueDateFrom, onChange: onUnloadingDueDateFromChange } = useFiltersLocalStorageState({
    paramName: 'unloadingDueDateFrom',
  });
  const { value: unloadingDueDateTo, onChange: onUnloadingDueDateToChange } = useFiltersLocalStorageState({
    paramName: 'unloadingDueDateTo',
  });

  const onClearAll = useCallback(async () => {
    clearAllFilters();
    // Reset pagination to first page
    await router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: '1' },
      },
      undefined,
      { shallow: true }
    );
  }, [clearAllFilters, router]);

  const activeFiltersCount = [
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
  ].filter(Boolean).length;

  return (
    <ShipmentsFiltersContext.Provider
      value={{
        activeFiltersCount,
        selectedClientId,
        selectedDriverId,
        selectedDispatcherId,
        selectedLoadStatus,
        selectedInvoiceStatus,
        selectedIsInvoiceOverdue,
        loadingReadyDateFrom: String(loadingReadyDateFrom || ''),
        loadingReadyDateTo: String(loadingReadyDateTo || ''),
        unloadingDueDateFrom: String(unloadingDueDateFrom || ''),
        unloadingDueDateTo: String(unloadingDueDateTo || ''),
        onClientChange,
        onDriverChange,
        onDispatcherChange,
        onLoadStatusChange,
        onInvoiceStatusChange,
        onIsInvoiceOverdueChange,
        onLoadingReadyDateFromChange,
        onLoadingReadyDateToChange,
        onUnloadingDueDateFromChange,
        onUnloadingDueDateToChange,
        onClearAll,
      }}
    >
      {children}
    </ShipmentsFiltersContext.Provider>
  );
};

export const ShipmentsFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ShipmentsFiltersStorageProvider>
      <ShipmentsFiltersProviderInner>{children}</ShipmentsFiltersProviderInner>
    </ShipmentsFiltersStorageProvider>
  );
};

export const useShipmentsFiltersContext = () => {
  const state = useContext(ShipmentsFiltersContext);

  if (!state) {
    throw new Error('useShipmentsFiltersContext must be used within a ShipmentsFiltersProvider');
  }

  return state;
};
