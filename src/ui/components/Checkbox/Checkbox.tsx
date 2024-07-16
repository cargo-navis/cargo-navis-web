import { Checkbox as HeadlessCheckbox } from '@headlessui/react';

import { Field, Label } from '@headlessui/react';
import { Icon, Text } from '@/ui';
import clsx from 'clsx';

export interface CheckboxProps {
  value: boolean;
  label?: string;
  onChange: (value: boolean) => void;
  name?: string;
  isDisabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ isDisabled, value, label, onChange, name }) => {
  return (
    <Field className="flex items-center gap-3">
      <HeadlessCheckbox
        name={name}
        disabled={isDisabled}
        checked={value}
        onChange={onChange}
        className={clsx(
          "group flex items-center justify-center size-[24px]",
          "rounded-s border-[2px] border-dark-300 dark:border-light-800 hover:border-dark-500 hover:dark:border-light-700",
          "bg-white-alpha-10 data-[checked]:bg-teal-700 dark:data-[checked]:bg-teal-600 text-white data-[checked]:!border-transparent cursor-pointer"
        )}
      >
        <Icon color="red" icon="CheckIcon" className="opacity-0 group-data-[checked]:opacity-100 transition-opacity duration-75" size="m" />
      </HeadlessCheckbox>
      <Label className="cursor-pointer">
        <Text color="text-color-1" variant="text-s">{label}</Text>
      </Label>
    </Field>
  );
}
