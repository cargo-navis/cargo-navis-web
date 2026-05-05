import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { DateInput, DatesProvider } from '@mantine/dates';

import { DateTimeFormat, formatDateString, getDateInLocalTimezone } from '@/lib/utils/date';
import { Icon2 } from '@/ui';

import { classnames, popoverProps } from './styles';

export interface DatepickerProps {
  value: string | null;
  onChange(date: string | null): void;
  isDisabled?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export const Datepicker: React.FC<DatepickerProps> = ({
  placeholder,
  isDisabled = false,
  isClearable = true,
  value,
  onChange,
  minDate,
  maxDate,
}) => {
  const isClearButtonVisible = isClearable && !!value;

  return (
    <DatesProvider settings={{ locale: 'hr', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
      <DateInput
        classNames={classnames}
        clearable
        dateParser={(dt) => {
          return new Date(dt);
        }}
        disabled={isDisabled}
        highlightToday
        leftSection={<Icon2 icon="IconCalendar" type="solid" />}
        maxDate={maxDate ? getDateInLocalTimezone(maxDate) : undefined}
        minDate={minDate ? getDateInLocalTimezone(minDate) : undefined}
        placeholder={placeholder}
        popoverProps={popoverProps}
        rightSection={isClearButtonVisible ? <Icon2 icon="IconX" onClick={() => onChange('')} /> : null}
        value={value ? getDateInLocalTimezone(value) : null}
        onChange={(date) => {
          const returnValue = date ? formatDateString(date.toDateString(), DateTimeFormat.IsoShort) : null;
          onChange(returnValue);
        }}
      />
    </DatesProvider>
  );
};
