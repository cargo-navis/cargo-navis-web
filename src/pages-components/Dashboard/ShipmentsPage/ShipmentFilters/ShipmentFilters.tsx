import { useState } from 'react';

import { useClients, useDrivers } from '@/lib/hooks';
import { Box, DisplayIf } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';

import { FilterFields } from './FilterFields';
import { FilterHeader } from './FilterHeader';
import { FilterTags } from './FilterTags';

interface ShipmentFiltersProps {
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
}

export const ShipmentFilters = ({
  selectedClientId,
  onClientChange,
  selectedDriverId,
  onDriverChange,
  selectedLoadingStatus,
  onLoadingStatusChange,
  selectedInvoiceStatus,
  onInvoiceStatusChange,
  loadingDateFrom,
  loadingDateTo,
  unloadingDateFrom,
  unloadingDateTo,
  onLoadingDateFromChange,
  onLoadingDateToChange,
  onUnloadingDateFromChange,
  onUnloadingDateToChange,
  onClearAll,
}: ShipmentFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();

  // Count active filters
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
  const hasActiveFilters = activeFiltersCount > 0;

  // Get selected option data for display
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box className="mt-4 border border-dark-200 dark:border-light-800 hover:border-dark-300 dark:hover:border-light-700 transition-colors duration-100 rounded-s">
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        hasActiveFilters={hasActiveFilters}
        isExpanded={isExpanded}
        onClearAll={onClearAll}
        onToggleExpanded={toggleExpanded}
      />

      {/* Collapsed state - show active filters */}
      {!isExpanded && hasActiveFilters && (
        <FilterTags
          loadingDateFrom={loadingDateFrom}
          loadingDateTo={loadingDateTo}
          selectedClient={selectedClient}
          selectedDriver={selectedDriver}
          selectedInvoiceStatus={selectedInvoiceStatus}
          selectedLoadingStatus={selectedLoadingStatus}
          unloadingDateFrom={unloadingDateFrom}
          unloadingDateTo={unloadingDateTo}
          onClientChange={onClientChange}
          onDriverChange={onDriverChange}
          onInvoiceStatusChange={onInvoiceStatusChange}
          onLoadingDateFromChange={onLoadingDateFromChange}
          onLoadingDateToChange={onLoadingDateToChange}
          onLoadingStatusChange={onLoadingStatusChange}
          onUnloadingDateFromChange={onUnloadingDateFromChange}
          onUnloadingDateToChange={onUnloadingDateToChange}
        />
      )}

      {/* Expanded content */}
      <DisplayIf condition={isExpanded}>
        <FilterFields
          clients={clients}
          drivers={drivers}
          loadingDateFrom={loadingDateFrom}
          loadingDateTo={loadingDateTo}
          selectedClientId={selectedClientId}
          selectedDriverId={selectedDriverId}
          selectedInvoiceStatus={selectedInvoiceStatus}
          selectedLoadingStatus={selectedLoadingStatus}
          unloadingDateFrom={unloadingDateFrom}
          unloadingDateTo={unloadingDateTo}
          onClientChange={onClientChange}
          onDriverChange={onDriverChange}
          onInvoiceStatusChange={onInvoiceStatusChange}
          onLoadingDateFromChange={onLoadingDateFromChange}
          onLoadingDateToChange={onLoadingDateToChange}
          onLoadingStatusChange={onLoadingStatusChange}
          onUnloadingDateFromChange={onUnloadingDateFromChange}
          onUnloadingDateToChange={onUnloadingDateToChange}
        />
      </DisplayIf>
    </Box>
  );
};
