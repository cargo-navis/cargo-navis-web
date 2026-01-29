import dayjs from 'dayjs';

import { Box, SelectOption } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

export type DateRangeOption = 'last-3-months' | 'last-6-months' | 'last-12-months' | 'year-to-date';

const DATE_RANGE_OPTIONS: SelectOption[] = [
  { value: 'last-3-months', label: 'Zadnja 3 mjeseca' },
  { value: 'last-6-months', label: 'Zadnjih 6 mjeseci' },
  { value: 'last-12-months', label: 'Zadnjih 12 mjeseci' },
  { value: 'year-to-date', label: 'Od početka godine' },
];

export const getDateRange = (option: DateRangeOption): { from: string; to: string } => {
  const now = dayjs();
  const to = now.format('YYYY-MM-DD');

  let from: string;
  switch (option) {
    case 'last-3-months':
      from = now.subtract(3, 'month').format('YYYY-MM-DD');
      break;
    case 'last-6-months':
      from = now.subtract(6, 'month').format('YYYY-MM-DD');
      break;
    case 'last-12-months':
      from = now.subtract(12, 'month').format('YYYY-MM-DD');
      break;
    case 'year-to-date':
      from = now.startOf('year').format('YYYY-MM-DD');
      break;
  }
  return { from, to };
};

interface DateRangeFilterProps {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  return (
    <Box className="w-[220px]">
      <SingleSelectWithLabels
        label="Razdoblje"
        options={DATE_RANGE_OPTIONS}
        value={value}
        onChange={(newValue) => onChange(newValue as DateRangeOption)}
      />
    </Box>
  );
};
