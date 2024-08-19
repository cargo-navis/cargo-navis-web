import { Radio as HeadlessRadio, Field, Label } from '@headlessui/react';

import { Box, Text } from '@/ui';
import clsx from 'clsx';

export type RadioOption = {
  value: string;
  label: string;
};

interface RadioProps {
  isDisabled?: boolean;
  option: RadioOption,
}

export const Radio: React.FC<RadioProps> = ({ isDisabled, option }) => {
  return (
    <Field disabled={isDisabled} className={clsx(
      "rounded-xl",
      "bg-white-alpha-25 dark:bg-white-alpha-10",
      "enabled:hover:bg-white-alpha-50 enabled:hover:dark:bg-white-alpha-25 transition-colors duration-75",
      "enabled:cursor-pointer"
    )}>
      <HeadlessRadio
        value={option.value}
        className="group flex items-center gap-3 p-4"
      >
        <Box
          className={clsx(
            "flex items-center size-[20px] justify-center",
            "rounded-circle border",
            "border-black-alpha-50 dark:border-white-alpha-25",
            "enabled:hover:border-black-alpha-75 enabled:hover:dark:border-white-alpha-50",
            "group-data-[checked]:bg-teal-700 dark:group-data-[checked]:bg-teal-600 group-data-[disabled]:bg-gray-100 group-data-[checked]:!border-transparent transition-colors duration-75"
          )}>
          <Box as="span" className="invisible size-2 rounded-circle bg-white group-data-[checked]:visible"/>
        </Box>
        <Box>
          <Label>
            <Text
              color="text-color-1"
              className="enabled:cursor-pointer"
              variant="text-s"
            >{option.label}</Text>
          </Label>
        </Box>
      </HeadlessRadio>
    </Field>
  );
}
