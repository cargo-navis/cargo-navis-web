import { useMemo } from 'react';

import { useVehicles } from '@/lib/hooks/api';
import { Box, FlexLayout, Icon, SelectOption, Text } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

interface VehicleFilterProps {
  isDisabled?: boolean;
  value: string | undefined;
  onChange(value: string | undefined): void;
}

export const VehicleFilter = ({ value, onChange, isDisabled }: VehicleFilterProps) => {
  const { data: vehicles, isLoading } = useVehicles();

  const options: SelectOption[] = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.map((vehicle) => ({
      value: vehicle.id,
      label: vehicle.registration || vehicle.id,
    }));
  }, [vehicles]);

  return (
    <Box className="w-[300px]">
      <SingleSelectWithLabels
        isClearable
        isDisabled={isLoading || isDisabled}
        isSearchable
        label={
          <FlexLayout className="gap-1 items-center justify-between">
            <Icon icon="IconTruck" />
            <Text color="text-color-3" variant="text-xxs-medium">
              Vozilo
            </Text>
          </FlexLayout>
        }
        options={options}
        value={value ?? ''}
        onChange={(newValue) => onChange(newValue ? String(newValue) : undefined)}
      />
    </Box>
  );
};
