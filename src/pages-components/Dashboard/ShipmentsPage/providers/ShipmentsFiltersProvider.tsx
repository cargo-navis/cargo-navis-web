import { createContext, useContext } from 'react';

import { useQueryParamState } from '@/lib/hooks';
import { SelectValue } from '@/ui';

export type ShipmentsFiltersContextType = {
  activeFiltersCount: number;
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  selectedLoadingStatus: SelectValue;
  selectedInvoiceStatus: SelectValue;
  loadingDateFrom: string;
  loadingDateTo: string;
  unloadingDateFrom: string;
  unloadingDateTo: string;
  onClientChange(clientId: SelectValue): void;
  onDriverChange(driverId: SelectValue): void;
  onLoadingStatusChange(loadingStatus: SelectValue): void;
  onInvoiceStatusChange(invoiceStatus: SelectValue): void;
  onLoadingDateFromChange(date: string): void;
  onLoadingDateToChange(date: string): void;
  onUnloadingDateFromChange(date: string): void;
  onUnloadingDateToChange(date: string): void;
  onClearAll(): void;
};

const ShipmentsFiltersContext = createContext<ShipmentsFiltersContextType | undefined>(undefined);

export const ShipmentsFiltersProvider = ({ children }: { children: React.ReactNode }) => {
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

  const activeFiltersCount = [
    selectedClientId,
    selectedDriverId,
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
        selectedLoadingStatus,
        selectedInvoiceStatus,
        loadingDateFrom: String(loadingDateFrom || ''),
        loadingDateTo: String(loadingDateTo || ''),
        unloadingDateFrom: String(unloadingDateFrom || ''),
        unloadingDateTo: String(unloadingDateTo || ''),
        onClientChange,
        onDriverChange,
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

export const useShipmentsFiltersContext = () => {
  const state = useContext(ShipmentsFiltersContext);

  if (!state) {
    throw new Error('useShipmentsFiltersContext must be used within a ShipmentsFiltersProvider');
  }

  return state;
};
