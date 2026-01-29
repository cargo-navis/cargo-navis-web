import { Box, SelectOption } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

export type GranularityOption = 'day' | 'week' | 'month' | 'year';

const GRANULARITY_OPTIONS: SelectOption[] = [
  { value: 'day', label: 'Dnevno' },
  { value: 'week', label: 'Tjedno' },
  { value: 'month', label: 'Mjesečno' },
  { value: 'year', label: 'Godišnje' },
];

interface GranularityFilterProps {
  value: GranularityOption;
  onChange: (value: GranularityOption) => void;
}

export const GranularityFilter = ({ value, onChange }: GranularityFilterProps) => {
  return (
    <Box className="w-[160px]">
      <SingleSelectWithLabels
        label="Granularnost"
        options={GRANULARITY_OPTIONS}
        value={value}
        onChange={(newValue) => onChange(newValue as GranularityOption)}
      />
    </Box>
  );
};
