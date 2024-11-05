import { getDateInLocalTimezone } from '@/lib/utils/date';
import { Icon } from '@/ui';
import { YearPickerInput } from '@mantine/dates';

import { classnames } from './styles';

export interface YearpickerProps {
  value: string | null;
  onChange(date: string | null): void;
  isDisabled?: boolean;
  isClearable?: boolean;
}

export const Yearpicker: React.FC<YearpickerProps> = ({ isDisabled, isClearable, value, onChange }) => {
  const isClearButtonVisible = isClearable && !!value;

  return (
    <YearPickerInput
      clearable
      className="bg-transparent"
      disabled={isDisabled}
      leftSection={<Icon icon="CalendarIcon" type="solid" />}
      rightSection={isClearButtonVisible ? <Icon icon="XMarkIcon" onClick={() => onChange('')} /> : null}
      classNames={classnames}
      value={value ? getDateInLocalTimezone(value) : null}
      onChange={(date) => {
        const returnValue = date ? date.getFullYear().toString() : null;
        onChange(returnValue);
      }}
    />
  );
};
