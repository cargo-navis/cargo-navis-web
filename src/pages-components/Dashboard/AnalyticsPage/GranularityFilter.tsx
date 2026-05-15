import { Box, FlexLayout, Icon, SelectOption, Text } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

export type GranularityOption = 'day' | 'week' | 'month' | 'year';

const GRANULARITY_OPTIONS: SelectOption[] = [
  { value: 'day', label: 'Danima' },
  { value: 'week', label: 'Tjednima' },
  { value: 'month', label: 'Mjesecima' },
  { value: 'year', label: 'Godinama' },
];

interface GranularityFilterProps {
  value: GranularityOption;
  onChange: (value: GranularityOption) => void;
}

export const GranularityFilter = ({ value, onChange }: GranularityFilterProps) => {
  return (
    <Box className="w-[160px]">
      <SingleSelectWithLabels
        label={
          <FlexLayout className="gap-1 items-center justify-between">
            <Icon icon="IconAdjustmentsHorizontal" />
            <Text color="text-color-3" variant="text-xxs-medium">
              Podjela po
            </Text>
          </FlexLayout>
        }
        options={GRANULARITY_OPTIONS}
        value={value}
        onChange={(newValue) => onChange(newValue as GranularityOption)}
      />
    </Box>
  );
};
