import dayjs from 'dayjs';

import { Box, SelectOption } from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

export type DateRangeOption =
  | 'last-3-months'
  | 'last-6-months'
  | 'last-12-months'
  | 'year-to-date'
  | 'last-2-years'
  | 'last-5-years'
  | 'total';

const DATE_RANGE_OPTIONS: SelectOption[] = [
  { value: 'year-to-date', label: 'Od početka godine' },
  { value: 'last-3-months', label: 'Zadnja 3 mjeseca' },
  { value: 'last-6-months', label: 'Zadnjih 6 mjeseci' },
  { value: 'last-12-months', label: 'Zadnjih 12 mjeseci' },
  { value: 'last-2-years', label: 'Zadnje 2 godine' },
  { value: 'last-5-years', label: 'Zadnjih 5 godina' },
  { value: 'total', label: 'Ukupno' },
];

export const getDateRange = (option: DateRangeOption): { from: string | undefined; to: string | undefined } => {
  if (option === 'total') {
    return { from: undefined, to: undefined };
  }

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
    case 'last-2-years':
      from = now.subtract(2, 'year').format('YYYY-MM-DD');
      break;
    case 'last-5-years':
      from = now.subtract(5, 'year').format('YYYY-MM-DD');
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
