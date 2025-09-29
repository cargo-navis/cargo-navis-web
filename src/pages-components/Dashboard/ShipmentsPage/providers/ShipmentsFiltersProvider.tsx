import { createContext, useContext } from 'react';

import { SelectValue } from '@/ui';

import { useFiltersQueryParamState } from '../ShipmentFilters/hooks';

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

export const ShipmentsFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    value: selectedClientId,
    onChange: onClientChange,
    onClearAll,
  } = useFiltersQueryParamState({
    paramName: 'clientId',
  });
  const { value: selectedDriverId, onChange: onDriverChange } = useFiltersQueryParamState({
    paramName: 'driverId',
  });
  const { value: selectedDispatcherId, onChange: onDispatcherChange } = useFiltersQueryParamState({
    paramName: 'dispatcherId',
  });
  const { value: selectedLoadingStatus, onChange: onLoadingStatusChange } = useFiltersQueryParamState({
    paramName: 'loadStatus',
  });
  const { value: selectedInvoiceStatus, onChange: onInvoiceStatusChange } = useFiltersQueryParamState({
    paramName: 'invoiceStatus',
  });
  const { value: loadingDateFrom, onChange: onLoadingDateFromChange } = useFiltersQueryParamState({
    paramName: 'loadingDateFrom',
  });
  const { value: loadingDateTo, onChange: onLoadingDateToChange } = useFiltersQueryParamState({
    paramName: 'loadingDateTo',
  });
  const { value: unloadingDateFrom, onChange: onUnloadingDateFromChange } = useFiltersQueryParamState({
    paramName: 'unloadingDateFrom',
  });
  const { value: unloadingDateTo, onChange: onUnloadingDateToChange } = useFiltersQueryParamState({
    paramName: 'unloadingDateTo',
  });

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

export const useShipmentsFiltersContext = () => {
  const state = useContext(ShipmentsFiltersContext);

  if (!state) {
    throw new Error('useShipmentsFiltersContext must be used within a ShipmentsFiltersProvider');
  }

  return state;
};
