import clsx from 'clsx';
import React from 'react';

import { FlexLayout, Icon2 } from '@/ui';

interface AppMenuButtonProps {
  shouldDisplayIndicator: boolean;
}

export const AppMenuButton = React.forwardRef<any, AppMenuButtonProps>(({ shouldDisplayIndicator, ...rest }, ref) => {
  return (
    <FlexLayout
      {...rest}
      className={clsx(
        'group relative p-2 justify-center items-center rounded-s isolate',
        'hover:bg-light-50 hover:text-teal-900 cursor-pointer',
        'data-[state=open]:bg-light-50 data-[state=open]:text-teal-900 cursor-pointer',
        "before:content-[''] before:absolute before:z-20 before:top-[6px] before:right-[8px] before:w-[5px] before:h-[5px]",
        'before:rounded-circle before:bg-red-500 before:opacity-0 before:transition before:duration-200',
        shouldDisplayIndicator && 'before:scale-[2] before:opacity-100'
      )}
      ref={ref}
    >
      <Icon2
        className="transition-transform group-hover:scale-110 group-focus:scale-110 duration-100 z-1"
        icon="IconBell"
        size="l"
      />
    </FlexLayout>
  );
});

AppMenuButton.displayName = 'AppMenuButton';
