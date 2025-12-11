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
  selectedLoadingStatus: SelectValue;
  selectedInvoiceStatus: SelectValue;
  loadingDateFrom: string;
  loadingDateTo: string;
  unloadingDateFrom: string;
  unloadingDateTo: string;
  onClientChange(clientId: SelectValue): void;
  onDriverChange(driverId: SelectValue): void;
  onDispatcherChange(dispatcherId: SelectValue): void;
  onLoadingStatusChange(loadingStatus: SelectValue): void;
  onInvoiceStatusChange(invoiceStatus: SelectValue): void;
  onLoadingDateFromChange(date: string): void;
  onLoadingDateToChange(date: string): void;
  onUnloadingDateFromChange(date: string): void;
  onUnloadingDateToChange(date: string): void;
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
  const { value: selectedLoadingStatus, onChange: onLoadingStatusChange } = useFiltersLocalStorageState({
    paramName: 'loadStatus',
  });
  const { value: selectedInvoiceStatus, onChange: onInvoiceStatusChange } = useFiltersLocalStorageState({
    paramName: 'invoiceStatus',
  });
  const { value: loadingDateFrom, onChange: onLoadingDateFromChange } = useFiltersLocalStorageState({
    paramName: 'loadingDateFrom',
  });
  const { value: loadingDateTo, onChange: onLoadingDateToChange } = useFiltersLocalStorageState({
    paramName: 'loadingDateTo',
  });
  const { value: unloadingDateFrom, onChange: onUnloadingDateFromChange } = useFiltersLocalStorageState({
    paramName: 'unloadingDateFrom',
  });
  const { value: unloadingDateTo, onChange: onUnloadingDateToChange } = useFiltersLocalStorageState({
    paramName: 'unloadingDateTo',
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
    selectedLoadingStatus,
    selectedInvoiceStatus,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
  ].filter(Boolean).length;

  return (
    <ShipmentsFiltersContext.Provider
      value={{
        activeFiltersCount,
        selectedClientId,
        selectedDriverId,
        selectedDispatcherId,
        selectedLoadingStatus,
        selectedInvoiceStatus,
        loadingDateFrom: String(loadingDateFrom || ''),
        loadingDateTo: String(loadingDateTo || ''),
        unloadingDateFrom: String(unloadingDateFrom || ''),
        unloadingDateTo: String(unloadingDateTo || ''),
        onClientChange,
        onDriverChange,
        onDispatcherChange,
        onLoadingStatusChange,
        onInvoiceStatusChange,
        onLoadingDateFromChange,
        onLoadingDateToChange,
        onUnloadingDateFromChange,
        onUnloadingDateToChange,
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
