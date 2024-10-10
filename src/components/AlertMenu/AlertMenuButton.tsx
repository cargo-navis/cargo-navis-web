import { FlexLayout, Icon } from '@/ui';
import clsx from 'clsx';
import React from 'react';

export const AlertButton = React.forwardRef((props, ref) => (
  <FlexLayout
    {...props}
    ref={ref}
    className={clsx(
      'group relative p-2 justify-center items-center rounded-s isolate',
      'hover:bg-light-50 hover:text-teal-900 cursor-pointer',
      'data-[state=open]:bg-light-50 data-[state=open]:text-teal-900 cursor-pointer',
      `before:content-[''] before:absolute before:z-20 before:top-[6px] before:right-[8px] before:w-[10px] before:h-[10px] before:rounded-circle before:bg-red-500`,
    )}
  >
    <Icon
      icon="BellIcon"
      size="l"
      className="transition-transform group-hover:scale-110 group-focus:scale-110 duration-100 z-1"
    />
  </FlexLayout>
));