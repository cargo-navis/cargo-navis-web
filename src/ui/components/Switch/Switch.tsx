import clsx from 'clsx';
import { forwardRef } from 'react';

import { Box } from '@/ui';

import { variantStyles } from './const';

export interface SwitchProps {
  value?: boolean;
  isDisabled?: boolean;
  onChange: (value: boolean) => void;
}

export const Switch = forwardRef<any, SwitchProps>(({ value, isDisabled, onChange }, ref) => {
  const { bg, circleColor, hoverStyle } = variantStyles[value ? 'active' : 'inactive'];

  return (
    <Box
      as="button"
      className={clsx('p-1 border-none rounded-l h-5 w-[40px] outline-0 shrink-0 disabled:opacity-40', bg, hoverStyle)}
      isDisabled={isDisabled}
      ref={ref}
      type="button"
      onClick={() => onChange(!value)}
    >
      <Box
        className={clsx(
          'h-4 w-4 transition-all duration-250 rounded-circle',
          value && 'translate-x-[16px]',
          circleColor
        )}
      />
    </Box>
  );
});

Switch.displayName = 'Switch';
