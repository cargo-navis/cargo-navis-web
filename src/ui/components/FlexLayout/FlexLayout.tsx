import clsx from 'clsx';
import React from 'react';

import { Box, BoxProps } from '../Box';

type FlexLayoutProps = BoxProps;

export const FlexLayout: React.FC<FlexLayoutProps> = ({ className, ...rest }) => {
  return <Box className={clsx('flex', className)} {...rest} />;
};

FlexLayout.displayName = 'FlexLayout';
