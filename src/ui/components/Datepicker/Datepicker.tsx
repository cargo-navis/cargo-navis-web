'use client';

import { DateInput, DatesProvider } from '@mantine/dates';

import { classnames } from './styles';
import { DateTimeFormat, formatDateString, getDateInLocalTimezone } from '@/lib/utils/date';

interface DatepickerProps {
  value: string | null;
  onChange(date: string | null): void;
}

export const Datepicker: React.FC<DatepickerProps> = ({ value, onChange }) => {
  return (
    <DatesProvider settings={{ locale: 'hr', firstDayOfWeek: 1, weekendDays: [0] }}>
      <DateInput
        clearable
        className="bg-transparent"
        classNames={classnames}
        dateParser={(dt) => {
          console.log(dt);
          return new Date(dt)
        }}
        value={value ? getDateInLocalTimezone(value) : null}
        onChange={(date) => {
          const returnValue = date ? formatDateString(date.toDateString(), DateTimeFormat.IsoShort) : null;
          onChange(returnValue);
        }}
      />
    </DatesProvider>
  );
}