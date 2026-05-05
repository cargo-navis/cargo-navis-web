import { YearPickerInput } from '@mantine/dates';

import { getDateInLocalTimezone } from '@/lib/utils/date';
import { Icon2 } from '@/ui';

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
      leftSection={<Icon2 icon="IconCalendarWeek" type="solid" />}
      rightSection={isClearButtonVisible ? <Icon2 icon="IconX" onClick={() => onChange(null)} /> : null}
      value={value ? getDateInLocalTimezone(value.toString()) : null}
      onChange={(date) => {
        const returnValue = date ? date.getFullYear() : null;
        onChange(returnValue);
      }}
    />
  );
};
