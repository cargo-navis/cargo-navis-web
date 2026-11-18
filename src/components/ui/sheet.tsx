'use client';

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        'fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-black/60',
        className
      )}
      data-slot="sheet-overlay"
      {...props}
    />
  );
}

// Width scale for left / right sheets.
const SHEET_SIZES = {
  sm: 'data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm', // 384
  md: 'data-[side=left]:sm:max-w-lg data-[side=right]:sm:max-w-lg', // 512
  lg: 'data-[side=left]:sm:max-w-xl data-[side=right]:sm:max-w-xl', // 640
} as const;

/**
 * Decided (KAN-55, /overlays/sheet): sizes sm 384 / md 512 (default) / lg 640; floating (8px off the window edges,
 * 12px corners); 40% backdrop like Dialog (a list quick look passes a transparent one and `modal={false}`); header
 * 24px with a line under; footer = Dialog's grey strip.
 */
function SheetContent({
  className,
  children,
  size = 'md',
  side = 'right',
  showCloseButton = true,
  overlayClassName,
  ...props
}: SheetPrimitive.Popup.Props & {
  size?: keyof typeof SHEET_SIZES;
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
  overlayClassName?: string;
}) {
  return (
    <SheetPortal>
      <SheetOverlay className={overlayClassName} />
      <SheetPrimitive.Popup
        className={cn(
          'fixed z-50 flex flex-col gap-0 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-2 data-[side=left]:left-2 data-[side=left]:w-[calc(100%-1rem)] data-[side=left]:rounded-xl data-[side=left]:border data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:w-[calc(100%-1rem)] data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] overflow-hidden',
          SHEET_SIZES[size],
          className
        )}
        data-side={side}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={<Button className="absolute top-4.5 right-4" size="icon-sm" variant="ghost" />}
          >
            <Icon icon="IconX" size="s" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-1 border-b px-6 py-5 pr-14', className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-auto flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end',
        className
      )}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      className={cn('font-heading text-lg font-bold tracking-tight text-foreground', className)}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
