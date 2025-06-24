import { useState } from 'react';

import { LoadStatus } from '@/lib/api/shipments';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients, useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, DisplayIf, FlexLayout, Icon, Text, TextButton } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';
import { SingleSelectWithLabels } from '@/ui/hocs';

import { loadStatusConfig } from './const';

interface ShipmentsFilterProps {
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  selectedLoadingStatus: SelectValue;
  onClientChange(clientId: SelectValue): void;
  onDriverChange(driverId: SelectValue): void;
  onLoadingStatusChange(loadingStatus: SelectValue): void;
  onClearAll(): void;
}

export const ShipmentsFilter = ({
  selectedClientId,
  onClientChange,
  selectedDriverId,
  onDriverChange,
  selectedLoadingStatus,
  onLoadingStatusChange,
  onClearAll,
}: ShipmentsFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const driverOptions = mapEmployeesToOptions(drivers);

  const loadingStatusOptions = Object.values(LoadStatus).map((status) => ({
    value: status,
    label: loadStatusConfig[status].label,
  }));

  // Count active filters
  const activeFiltersCount = [selectedClientId, selectedDriverId, selectedLoadingStatus].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  // Get selected option labels for display
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);
  const selectedLoadingStatusLabel = selectedLoadingStatus
    ? loadStatusConfig[selectedLoadingStatus as LoadStatus]?.label
    : null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box className="mt-4 border border-dark-200 dark:border-light-800 hover:border-dark-300 dark:hover:border-light-700 transition-colors duration-100 rounded-s">
      {/* Header */}
      <FlexLayout className="items-center justify-between p-4 cursor-pointer" onClick={toggleExpanded}>
        <FlexLayout className="items-center gap-2">
          <Icon
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            icon="ChevronRightIcon"
          />
          <Text variant="text-s-medium">Filteri {hasActiveFilters && `(${activeFiltersCount} aktivni)`}</Text>
        </FlexLayout>
        <DisplayIf condition={hasActiveFilters}>
          <TextButton
            iconLeft="TrashIcon"
            size="s"
            text="Očisti filtere"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
          />
        </DisplayIf>
      </FlexLayout>

      {/* Collapsed state - show active filters */}
      {!isExpanded && hasActiveFilters && (
        <Box className="px-4 pb-4">
          <FlexLayout className="gap-2 flex-wrap">
            {selectedClient && (
              <Box className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-s text-xs">
                <Text variant="text-xs">
                  <strong>Klijent:</strong> {selectedClient.name}
                </Text>
                <Icon
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full w-4 h-4 flex items-center justify-center"
                  icon="XMarkIcon"
                  onClick={() => onClientChange('')}
                />
              </Box>
            )}
            <DisplayIf condition={!!selectedDriver}>
              <Box className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-s text-xs">
                <Text variant="text-xs">
                  <strong>Vozač:</strong> {selectedDriver?.fullName}
                </Text>
                <Icon
                  className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full w-4 h-4 flex items-center justify-center"
                  icon="XMarkIcon"
                  onClick={() => onDriverChange('')}
                />
              </Box>
            </DisplayIf>
            <DisplayIf condition={!!selectedLoadingStatusLabel}>
              <Box className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-s text-xs">
                <Text variant="text-xs">
                  <strong>Status utovara:</strong> {selectedLoadingStatusLabel}
                </Text>
                <Icon
                  className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full w-4 h-4 flex items-center justify-center"
                  icon="XMarkIcon"
                  onClick={() => onLoadingStatusChange('')}
                />
              </Box>
            </DisplayIf>
          </FlexLayout>
        </Box>
      )}

      {/* Expanded content */}
      <DisplayIf condition={isExpanded}>
        <Box className="px-4 pb-4">
          <FlexLayout className="gap-4 flex-col md:flex-row">
            <Box className="flex-1">
              <ClientSideOnly>
                <SingleSelectWithLabels
                  isClearable
                  isPortal
                  isSearchable
                  label="Klijent"
                  options={clientOptions}
                  placeholder="Odaberi klijenta..."
                  value={selectedClientId}
                  onChange={onClientChange}
                />
              </ClientSideOnly>
            </Box>

            <Box className="flex-1">
              <ClientSideOnly>
                <SingleSelectWithLabels
                  isClearable
                  isPortal
                  isSearchable
                  label="Vozač"
                  options={driverOptions}
                  placeholder="Odaberi vozača..."
                  value={selectedDriverId}
                  onChange={onDriverChange}
                />
              </ClientSideOnly>
            </Box>

            <Box className="flex-1">
              <ClientSideOnly>
                <SingleSelectWithLabels
                  isClearable
                  isPortal
                  isSearchable
                  label="Status utovara"
                  options={loadingStatusOptions}
                  placeholder="Odaberi status..."
                  value={selectedLoadingStatus}
                  onChange={onLoadingStatusChange}
                />
              </ClientSideOnly>
            </Box>
          </FlexLayout>
        </Box>
      </DisplayIf>
    </Box>
  );
};
