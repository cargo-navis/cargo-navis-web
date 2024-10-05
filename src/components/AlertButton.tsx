import { FlexLayout, Icon } from '@/ui';
import clsx from 'clsx';
import { useState } from 'react';

export const AlertButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FlexLayout
      className={clsx(
        'group relative p-2 justify-center items-center rounded-s isolate',
        'hover:bg-light-50 hover:text-teal-900',
        `before:content-[''] before:absolute before:z-20 before:top-[6px] before:right-[8px] before:w-[10px] before:h-[10px] before:rounded-circle before:bg-red-500`,
      )}
      tabIndex={0}
      onClick={() => setIsOpen(true)}
      onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
    >
      <Icon icon="BellIcon" size="l" className="transition-transform group-hover:scale-110 group-focus:scale-110 duration-100 z-1" />
    </FlexLayout>
  );
};
