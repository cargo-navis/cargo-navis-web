import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

import { Box, Icon, type IconType } from '@/ui';

type DefaultProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'autoComplete' | 'autoFocus' | 'id' | 'name' | 'placeholder' | 'onBlur' | 'min' | 'max' | 'step'
>;

export interface TextInputProps extends DefaultProps {
  value: string;
  iconLeft?: IconType;
  isDisabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  onChange: (value: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  iconLeft,
  isDisabled,
  type = 'text',
  value,
  onChange,
  ...rest
}) => {
  return (
    <Box
      className={clsx(
        'relative',
        'border-[2px] rounded-s border-dark-300 dark:border-light-800',
        'hover:border-dark-500 hover:dark:border-light-700',
        'focus-within:!border-teal-600 dark:focus-within:!border-teal-800',
        'isolate',
        iconLeft && 'pl-6 pr-3',
        isDisabled && 'opacity-50 pointer-events-none'
      )}
      isDisabled={isDisabled}
    >
      {iconLeft && (
        <Box className="absolute z-20 left-3 top-3">
          <Icon color="text-dark-600 dark:text-light-300" icon={iconLeft} {...rest} />
        </Box>
      )}
      <Box
        as="input"
        className={clsx(
          'p-3 w-full h-full bg-transparent outline-none z-20 rounded-s',
          'font-display md:text-s text-dark-800 dark:text-light-50 placeholder:text-dark-400 dark:placeholder:text-light-800',
          'caret-teal-600 dark:caret-teal-800'
        )}
        isDisabled={isDisabled}
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        {...rest}
      />
    </Box>
  );
};
