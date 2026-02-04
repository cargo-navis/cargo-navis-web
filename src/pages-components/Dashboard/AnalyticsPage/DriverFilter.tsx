import { useMemo } from 'react';

import { useDrivers } from '@/lib/hooks/api';
import { Box, FlexLayout, Icon, SelectOption, Text } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';
interface DriverFilterProps {
  isDisabled?: boolean;
  value: string | undefined;
  onChange(value: string | undefined): void;
}

export const DriverFilter = ({ value, onChange, isDisabled }: DriverFilterProps) => {
  const { data: drivers, isLoading } = useDrivers();

  const options: SelectOption[] = useMemo(() => {
    if (!drivers) return [];
    return drivers.map((driver) => ({
      value: driver.id,
      label: driver.fullName || `${driver.firstName} ${driver.lastName}`,
    }));
  }, [drivers]);

  return (
    <Box className="w-[300px]">
      <SingleSelectWithLabels
        isClearable
        isDisabled={isLoading || isDisabled}
        isSearchable
        label={
          <FlexLayout className="gap-1 items-center justify-between">
            <Icon icon="UserIcon" />
            <Text color="text-color-3" variant="text-xxs-medium">
              Vozač
            </Text>
          </FlexLayout>
        }
        options={options}
        placeholder="Svi vozači"
        value={value ?? ''}
        onChange={(newValue) => onChange(newValue ? String(newValue) : undefined)}
      />
    </Box>
  );
};
