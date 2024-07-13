import { Checkbox as HeadlessCheckbox } from '@headlessui/react';

import { Field, Label } from '@headlessui/react';
import { Icon, Text } from '@/ui';

export interface CheckboxProps {
  value: boolean;
  label?: string;
  onChange: (value: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ value, label, onChange }) => {
  return (
    <Field className="flex items-center gap-3">
      <HeadlessCheckbox
        checked={value}
        onChange={onChange}
        className="group flex items-center justify-center size-[24px] rounded-s border bg-white data-[checked]:bg-teal-700 dark:data-[checked]:bg-teal-600 data-[checked]:text-white cursor-pointer"
      >
        <Icon color="red" icon="CheckIcon" className="opacity-0 group-data-[checked]:opacity-100 transition-opacity duration-75" size="m" />
      </HeadlessCheckbox>
      <Label className="cursor-pointer">
        <Text color="text-color-1" variant="text-s">{label}</Text>
      </Label>
    </Field>
  );
}
