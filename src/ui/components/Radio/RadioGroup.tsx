import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { Radio, RadioOption } from '@/ui';
import clsx from 'clsx';

export interface RadioGroupProps {
  name?: string;
  isDisabled?: boolean;
  value: string;
  options: RadioOption[];
  onChange(value: string): void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ isDisabled,  value, options, onChange, ...rest }) => {
  return (
    <HeadlessRadioGroup disabled={isDisabled} value={value} onChange={onChange} className={clsx('space-y-2', isDisabled && 'opacity-50')} {...rest}>
      {options.map(option => (
        <Radio isDisabled={isDisabled} option={option} key={option.value} />
      ))}
    </HeadlessRadioGroup>
  );
}