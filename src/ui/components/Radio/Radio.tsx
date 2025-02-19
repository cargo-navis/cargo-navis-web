import { Field, Label, Radio as HeadlessRadio } from '@headlessui/react';
import clsx from 'clsx';

import { Box, Text } from '@/ui';

export type RadioOption = {
  value: string | boolean;
  label: string;
};

interface RadioProps {
  isDisabled?: boolean;
  option: RadioOption;
}

export const Radio: React.FC<RadioProps> = ({ isDisabled, option }) => {
  return (
    <Field
      className={clsx(
        'rounded-xl',
        'bg-dark-100 dark:bg-white-alpha-10 transition-colors duration-75',
        !isDisabled && 'hover:bg-white-alpha-50 hover:dark:bg-white-alpha-25',
        !isDisabled && 'cursor-pointer'
      )}
      disabled={isDisabled}
    >
      <HeadlessRadio className="group flex items-center gap-3 p-4" value={option.value}>
        <Box
          className={clsx(
            'flex items-center size-[20px] justify-center',
            'rounded-circle border',
            'border-black-alpha-50 dark:border-white-alpha-25',
            'enabled:hover:border-black-alpha-75 enabled:hover:dark:border-white-alpha-50',
            'group-data-[checked]:bg-teal-700 dark:group-data-[checked]:bg-teal-600 group-data-[disabled]:bg-gray-100 group-data-[checked]:!border-transparent transition-colors duration-75'
          )}
        >
          <Box as="span" className="invisible size-2 rounded-circle bg-white group-data-[checked]:visible" />
        </Box>
        <Box>
          <Label>
            <Text className={clsx(!isDisabled && 'cursor-pointer')} color="text-color-1" variant="text-s">
              {option.label}
            </Text>
          </Label>
        </Box>
      </HeadlessRadio>
    </Field>
  );
};
