import clsx from 'clsx';
import React from 'react';

import { Box, type BoxProps } from '@/ui';

export const FlexLayout = React.forwardRef<any, BoxProps>(({ className, ...rest }, ref) => {
  return <Box className={clsx('flex', className)} ref={ref} {...rest} />;
});

FlexLayout.displayName = 'FlexLayout';
