import { useState } from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients, useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, DisplayIf, FlexLayout, Icon, Text, TextButton } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';
import { SingleSelectWithLabels } from '@/ui/hocs';

interface ShipmentsFilterProps {
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  onClientChange(clientId: SelectValue): void;
  onDriverChange(driverId: SelectValue): void;
  onClearAll(): void;
}

export const ShipmentsFilter = ({
  selectedClientId,
  onClientChange,
  selectedDriverId,
  onDriverChange,
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

  // Count active filters
  const activeFiltersCount = [selectedClientId, selectedDriverId].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  // Get selected option labels for display
  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box className="mt-4 border border-dark-300 dark:border-light-800 rounded-s">
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
          </FlexLayout>
        </Box>
      </DisplayIf>
    </Box>
  );
};
