import { Radio as HeadlessRadio, Field, Label } from '@headlessui/react';

import { Box, Text } from '@/ui';

export type RadioOption = {
  value: string;
  label: string;
};

interface RadioProps {
  option: RadioOption,
}

export const Radio: React.FC<RadioProps> = ({ option }) => {
  return (
    <Field className="cursor-pointer bg-white-alpha-25 dark:bg-white-alpha-10 rounded-xl">
      <HeadlessRadio
        value={option.value}
        className="group flex items-center gap-3 p-4"
      >
        <Box
          className="flex items-center size-5 justify-center rounded-circle border border-black-alpha-50 dark:border-white-alpha-50 group-data-[checked]:bg-teal-700 dark:group-data-[checked]:bg-teal-600 group-data-[disabled]:bg-gray-100 transition-colors">
          <Box as="span" className="invisible size-2 rounded-circle bg-white group-data-[checked]:visible"/>
        </Box>
        <Box>
          <Label>
            <Text color="text-color-1" className="cursor-pointer" variant="text-s">{option.label}</Text>
          </Label>
        </Box>
      </HeadlessRadio>
    </Field>
  );
}
