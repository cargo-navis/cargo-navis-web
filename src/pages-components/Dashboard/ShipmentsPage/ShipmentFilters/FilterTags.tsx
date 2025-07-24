import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useClients, useDrivers } from '@/lib/hooks';
import { Box, DisplayIf, FlexLayout } from '@/ui';

import { invoiceStatusConfig, loadStatusConfig } from '../const';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';
import { FilterTag } from './FilterTag';

export const FilterTags = () => {
  const {
    selectedClientId,
    selectedDriverId,
    selectedLoadingStatus,
    selectedInvoiceStatus,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
    onClientChange,
    onDriverChange,
    onLoadingStatusChange,
    onInvoiceStatusChange,
    onLoadingDateFromChange,
    onLoadingDateToChange,
    onUnloadingDateFromChange,
    onUnloadingDateToChange,
  } = useShipmentsFiltersContext();

  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);

  // Compute labels from values
  const selectedLoadingStatusLabel = selectedLoadingStatus
    ? loadStatusConfig[selectedLoadingStatus as LoadStatus]?.label
    : null;
  const selectedInvoiceStatusLabel = selectedInvoiceStatus
    ? invoiceStatusConfig[selectedInvoiceStatus as InvoiceStatus]?.label
    : null;

  return (
    <Box className="px-4 pb-4">
      <FlexLayout className="gap-2 flex-wrap">
        {selectedClient && (
          <FilterTag
            colorScheme="blue"
            label="Klijent"
            value={selectedClient.name}
            onRemove={() => onClientChange('')}
          />
        )}
        <DisplayIf condition={!!selectedDriver}>
          <FilterTag
            colorScheme="green"
            label="Vozač"
            value={selectedDriver?.fullName || ''}
            onRemove={() => onDriverChange('')}
          />
        </DisplayIf>
        <DisplayIf condition={!!selectedLoadingStatusLabel}>
          <FilterTag
            colorScheme="purple"
            label="Status utovara"
            value={selectedLoadingStatusLabel || ''}
            onRemove={() => onLoadingStatusChange('')}
          />
        </DisplayIf>
        <DisplayIf condition={!!selectedInvoiceStatusLabel}>
          <FilterTag
            colorScheme="orange"
            label="Status fakture"
            value={selectedInvoiceStatusLabel || ''}
            onRemove={() => onInvoiceStatusChange('')}
          />
        </DisplayIf>
        {loadingDateFrom && (
          <FilterTag
            colorScheme="blue"
            label="Datum utovara od"
            value={loadingDateFrom}
            onRemove={() => onLoadingDateFromChange('')}
          />
        )}
        {loadingDateTo && (
          <FilterTag
            colorScheme="blue"
            label="Datum utovara do"
            value={loadingDateTo}
            onRemove={() => onLoadingDateToChange('')}
          />
        )}
        {unloadingDateFrom && (
          <FilterTag
            colorScheme="green"
            label="Datum istovara od"
            value={unloadingDateFrom}
            onRemove={() => onUnloadingDateFromChange('')}
          />
        )}
        {unloadingDateTo && (
          <FilterTag
            colorScheme="green"
            label="Datum istovara do"
            value={unloadingDateTo}
            onRemove={() => onUnloadingDateToChange('')}
          />
        )}
      </FlexLayout>
    </Box>
  );
};
