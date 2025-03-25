import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import clsx from 'clsx';

import { Radio, type RadioOption } from '@/ui';

export interface RadioGroupProps {
  name?: string;
  isDisabled?: boolean;
  value: string;
  options: RadioOption[];
  onChange(value: string): void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ isDisabled, value, options, onChange, ...rest }) => {
  return (
    <HeadlessRadioGroup
      className={clsx('space-y-2', isDisabled && 'opacity-50')}
      disabled={isDisabled}
      value={value}
      onChange={onChange}
      {...rest}
    >
      {options.map((option) => (
        <Radio isDisabled={isDisabled} key={option.value as string} option={option} />
      ))}
    </HeadlessRadioGroup>
  );
};
