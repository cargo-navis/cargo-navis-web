import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { DateInput, DatesProvider } from '@mantine/dates';

import { DateTimeFormat, formatDateString, getDateInLocalTimezone } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { classnames } from './styles';

export interface DatepickerProps {
  value: string | null;
  onChange(date: string | null): void;
  isDisabled?: boolean;
  isClearable?: boolean;
}

export const Datepicker: React.FC<DatepickerProps> = ({ isDisabled = false, isClearable = true, value, onChange }) => {
  const isClearButtonVisible = isClearable && !!value;

  return (
    <DatesProvider settings={{ locale: 'hr', firstDayOfWeek: 1, weekendDays: [0] }}>
      <DateInput
        className="bg-transparent isolate"
        classNames={classnames}
        clearable
        dateParser={(dt) => {
          return new Date(dt);
        }}
        disabled={isDisabled}
        leftSection={<Icon icon="CalendarIcon" type="solid" />}
        rightSection={isClearButtonVisible ? <Icon icon="XMarkIcon" onClick={() => onChange('')} /> : null}
        value={value ? getDateInLocalTimezone(value) : null}
        onChange={(date) => {
          const returnValue = date ? formatDateString(date.toDateString(), DateTimeFormat.IsoShort) : null;
          onChange(returnValue);
        }}
      />
    </DatesProvider>
  );
};
