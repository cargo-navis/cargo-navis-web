import type { Client } from '@/lib/api/clients.d';
import type { Employee } from '@/lib/api/employees.d';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { Box, DisplayIf, FlexLayout } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';

import { invoiceStatusConfig, loadStatusConfig } from '../const';
import { FilterTag } from './FilterTag';

interface FilterTagsProps {
  selectedClient: Client | undefined;
  selectedDriver: Employee | undefined;
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
}

export const FilterTags = ({
  selectedClient,
  selectedDriver,
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
}: FilterTagsProps) => {
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
