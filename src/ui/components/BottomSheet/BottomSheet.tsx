import clsx from 'clsx';
import type { ReactNode } from 'react';

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { Box } from '../Box';
import { Text } from '../Text';

interface BottomSheetProps {
  isOpen: boolean;
  onOpenChange(isOpen: boolean): void;
  /** Always set for screen readers; shown as the heading unless `header` replaces it. */
  title: string;
  description?: string;
  /** Custom header content; the title then stays screen-reader only. */
  header?: ReactNode;
  /** Pinned below the scrollable body, e.g. action buttons. */
  footer?: ReactNode;
  /** Opened from inside another open sheet, so closing it keeps the parent open. */
  isNested?: boolean;
  children?: ReactNode;
}

/** Floating mobile bottom sheet with a swipe handle, capped at the page width. */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  header,
  footer,
  isNested = false,
  children,
}) => (
  <Drawer
    nested={isNested}
    open={isOpen}
    shouldScaleBackground={false}
    showSwipeHandle
    variant="floating"
    onOpenChange={onOpenChange}
  >
    <DrawerContent
      className="mx-auto max-w-[480px]"
      // Without a description, opt out explicitly so Radix doesn't warn about a missing one.
      {...(!description && { 'aria-describedby': undefined })}
    >
      <DrawerHeader
        className={clsx(
          'gap-1 px-4 pb-4 pt-3 text-left',
          !!children && 'border-b border-dark-100 dark:border-light-850'
        )}
      >
        <DrawerTitle className={clsx(header && 'sr-only')}>
          <Text color="text-color-1" variant="text-m-medium">
            {title}
          </Text>
        </DrawerTitle>
        {description && (
          <DrawerDescription className={clsx(header && 'sr-only')}>
            <Text color="text-color-3" variant="text-xs">
              {description}
            </Text>
          </DrawerDescription>
        )}
        {header}
      </DrawerHeader>
      {children && <Box className={clsx('overflow-y-auto px-4 pt-4', footer ? 'pb-4' : 'pb-6')}>{children}</Box>}
      {footer && <Box className="px-4 pb-6 pt-2">{footer}</Box>}
    </DrawerContent>
  </Drawer>
);
