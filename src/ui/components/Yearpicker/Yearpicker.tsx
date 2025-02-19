import { YearPickerInput } from '@mantine/dates';

import { getDateInLocalTimezone } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { classnames } from './styles';

export interface YearpickerProps {
  value: number | null;
  onChange(date: number | null): void;
  isDisabled?: boolean;
  isClearable?: boolean;
}

export const Yearpicker: React.FC<YearpickerProps> = ({ isDisabled, isClearable, value, onChange }) => {
  const isClearButtonVisible = isClearable && !!value;

  return (
    <YearPickerInput
      className="bg-transparent"
      classNames={classnames}
      clearable
      disabled={isDisabled}
      leftSection={<Icon icon="CalendarIcon" type="solid" />}
      rightSection={isClearButtonVisible ? <Icon icon="XMarkIcon" onClick={() => onChange(null)} /> : null}
      value={value ? getDateInLocalTimezone(value.toString()) : null}
      onChange={(date) => {
        const returnValue = date ? date.getFullYear() : null;
        onChange(returnValue);
      }}
    />
  );
};
