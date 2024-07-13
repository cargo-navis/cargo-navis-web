import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { Radio, RadioOption } from '@/ui';

interface RadioGroupProps {
  value: string;
  options: RadioOption[];
  onChange(value: string): void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ value, options, onChange }) => {
  return (
    <HeadlessRadioGroup value={value} onChange={onChange} className="space-y-2">
      {options.map(option => (
        <Radio option={option} key={option.value} />
      ))}
    </HeadlessRadioGroup>
  );
}