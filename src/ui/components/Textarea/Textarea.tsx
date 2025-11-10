import clsx from 'clsx';
import { forwardRef } from 'react';

import { Box } from '@/ui';

export interface TextareaProps {
  value: string;
  onChange(value: string): void;
  onBlur?: () => void;
  isDisabled?: boolean;
  placeholder?: string;
  charLimit?: number;
  rows?: number;
}

export const Textarea = forwardRef<any, TextareaProps>(
  ({ isDisabled = false, placeholder, charLimit, rows = 4, value, onChange, onBlur }, ref) => {
    return (
      <Box
        as="textarea"
        className={clsx(
          'py-2 px-3 w-full bg-transparent outline-none resize-y disabled:opacity-50',
          'font-display text-dark-800 dark:text-light-50',
          'placeholder:text-dark-400 dark:placeholder:text-light-800',
          'autofill:!text-dark-800 dark:autofill:!text-light-50 autofill:shadow-[0_0_0_1000px_#00000000_inset]',
          'autofill:transition-colors autofill:duration-[5000s] autofill:delay-0',
          'border-[2px] rounded-s border-dark-300 dark:border-light-800',
          'hover:enabled:border-dark-500 hover:enabled:dark:border-light-700',
          'focus-within:!border-teal-600 dark:focus-within:!border-teal-800',
          'caret-teal-500 dark:caret-teal-500',
          isDisabled && 'opacity-50 pointer-events-none'
        )}
        isDisabled={isDisabled}
        maxLength={charLimit}
        placeholder={placeholder}
        ref={ref}
        rows={rows}
        value={value}
        onBlur={onBlur}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
