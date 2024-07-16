import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { Radio, RadioOption } from '@/ui';

export interface RadioGroupProps {
  name?: string;
  isDisabled?: boolean;
  value: string;
  options: RadioOption[];
  onChange(value: string): void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ isDisabled,  value, options, onChange, ...rest }) => {
  return (
    <HeadlessRadioGroup disabled={isDisabled} value={value} onChange={onChange} className="space-y-2" {...rest}>
      {options.map(option => (
        <Radio option={option} key={option.value} />
      ))}
    </HeadlessRadioGroup>
  );
}