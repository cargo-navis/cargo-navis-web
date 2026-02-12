import { useMemo } from 'react';

import { useClients } from '@/lib/hooks/api';
import { Box, FlexLayout, Icon, SelectOption, Text } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

interface ClientFilterProps {
  isDisabled?: boolean;
  value: string | undefined;
  onChange(value: string | undefined): void;
}

export const ClientFilter = ({ value, onChange, isDisabled }: ClientFilterProps) => {
  const { data: clients, isLoading } = useClients();

  const options: SelectOption[] = useMemo(() => {
    if (!clients) return [];
    return clients.map((client) => ({
      value: client.id,
      label: client.name,
    }));
  }, [clients]);

  return (
    <Box className="w-[300px]">
      <SingleSelectWithLabels
        isClearable
        isDisabled={isLoading || isDisabled}
        isSearchable
        label={
          <FlexLayout className="gap-1 items-center justify-between">
            <Icon icon="BriefcaseIcon" />
            <Text color="text-color-3" variant="text-xxs-medium">
              Klijent
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
