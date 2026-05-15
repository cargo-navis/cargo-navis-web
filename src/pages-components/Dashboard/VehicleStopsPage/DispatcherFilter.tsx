import { useMemo } from 'react';

import { useDispatchers } from '@/lib/hooks/api';
import { Box, FlexLayout, Icon, SelectOption, Text } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

interface DispatcherFilterProps {
  isDisabled?: boolean;
  value: string | undefined;
  onChange(value: string | undefined): void;
}

export const DispatcherFilter = ({ value, onChange, isDisabled }: DispatcherFilterProps) => {
  const { data: dispatchers, isLoading } = useDispatchers();

  const options: SelectOption[] = useMemo(() => {
    if (!dispatchers) return [];
    return dispatchers.map((dispatcher) => ({
      value: dispatcher.id,
      label: dispatcher.fullName || `${dispatcher.firstName} ${dispatcher.lastName}`,
    }));
  }, [dispatchers]);

  return (
    <Box className="w-[300px]">
      <SingleSelectWithLabels
        isClearable
        isDisabled={isLoading || isDisabled}
        isSearchable
        label={
          <FlexLayout className="gap-1 items-center justify-between">
            <Icon icon="IconUser" />
            <Text color="text-color-3" variant="text-xxs-medium">
              Disponent
            </Text>
          </FlexLayout>
        }
        options={options}
        placeholder="Svi disponenti"
        value={value ?? ''}
        onChange={(newValue) => onChange(newValue ? String(newValue) : undefined)}
      />
    </Box>
  );
};
