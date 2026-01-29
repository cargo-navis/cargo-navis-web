import { Box, SelectOption } from '@/ui';
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
        label="Podjela po"
        options={GRANULARITY_OPTIONS}
        value={value}
        onChange={(newValue) => onChange(newValue as GranularityOption)}
      />
    </Box>
  );
};
