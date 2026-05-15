import { InvoiceStatus } from '@/lib/api/shipments';
import { useClients, useDispatchers, useDrivers } from '@/lib/hooks';
import { Box, DisplayIf, FlexLayout } from '@/ui';

import { activeLabels, invoiceStatusConfig } from '../const';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';
import { FilterTag } from './FilterTag';

export const FilterTags = () => {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedIsActive,
    selectedInvoiceStatus,
    selectedIsInvoiceOverdue,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
    onClientChange,
    onDriverChange,
    onDispatcherChange,
    onIsActiveChange,
    onInvoiceStatusChange,
    onIsInvoiceOverdueChange,
    onLoadingDateFromChange,
    onLoadingDateToChange,
    onUnloadingDateFromChange,
    onUnloadingDateToChange,
  } = useShipmentsFiltersContext();

  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);
  const selectedDispatcher = dispatchers.find((dispatcher) => dispatcher.id === selectedDispatcherId);

  // Compute labels from values
  const selectedIsActiveLabel =
    selectedIsActive === 'true' || selectedIsActive === 'false' ? activeLabels[selectedIsActive] : null;
  const selectedInvoiceStatusLabel = selectedInvoiceStatus
    ? invoiceStatusConfig[selectedInvoiceStatus as InvoiceStatus]?.label
    : null;
  const selectedIsInvoiceOverdueLabel = selectedIsInvoiceOverdue
    ? selectedIsInvoiceOverdue === 'true'
      ? 'Da'
      : 'Ne'
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
        <DisplayIf condition={!!selectedDispatcher}>
          <FilterTag
            colorScheme="green"
            label="Disponent"
            value={selectedDispatcher?.fullName || ''}
            onRemove={() => onDispatcherChange('')}
          />
        </DisplayIf>
        <DisplayIf condition={!!selectedIsActiveLabel}>
          <FilterTag
            colorScheme="purple"
            label="Izvršenost"
            value={selectedIsActiveLabel || ''}
            onRemove={() => onIsActiveChange('')}
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
        <DisplayIf condition={!!selectedIsInvoiceOverdueLabel}>
          <FilterTag
            colorScheme="red"
            label="Valuta istekla"
            value={selectedIsInvoiceOverdueLabel || ''}
            onRemove={() => onIsInvoiceOverdueChange('')}
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
