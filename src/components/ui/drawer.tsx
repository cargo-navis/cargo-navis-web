import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

type DrawerVariant = 'default' | 'floating';

interface DrawerOptions {
  showSwipeHandle: boolean;
  variant: DrawerVariant;
}

// Drawer-level options that DrawerContent renders from.
const DrawerOptionsContext = React.createContext<DrawerOptions>({ showSwipeHandle: false, variant: 'default' });

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  /** Renders vaul's draggable handle at the top of a bottom drawer. */
  showSwipeHandle?: boolean;
  /** `floating`: bottom sheet inset from the screen edges, fully rounded, with a blurred backdrop. */
  variant?: DrawerVariant;
  /** Opened from inside another open drawer (vaul's NestedRoot), so closing it leaves the parent open. */
  nested?: boolean;
};

const Drawer = ({
  shouldScaleBackground = true,
  showSwipeHandle = false,
  variant = 'default',
  nested = false,
  ...props
}: DrawerProps) => {
  const options = React.useMemo(() => ({ showSwipeHandle, variant }), [showSwipeHandle, variant]);
  const Root = nested ? DrawerPrimitive.NestedRoot : DrawerPrimitive.Root;

  return (
    <DrawerOptionsContext.Provider value={options}>
      <Root shouldScaleBackground={shouldScaleBackground} {...props} />
    </DrawerOptionsContext.Provider>
  );
};
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-black/60', className)} ref={ref} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { showSwipeHandle, variant } = React.useContext(DrawerOptionsContext);
  const isFloating = variant === 'floating';

  return (
    <DrawerPortal>
      <DrawerOverlay className={cn(isFloating && 'backdrop-blur-sm')} />
      <DrawerPrimitive.Content
        className={cn(
          'group/drawer-content fixed z-50 flex h-auto flex-col bg-background dark:bg-[#1a1a1a] dark:border-light-850',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-[10px]',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-[10px]',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm data-[vaul-drawer-direction=right]:rounded-l-[10px] border-l',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=left]:rounded-r-[10px]',
          // Floating bottom sheet: 8px off the screen edges (plus the iPhone home bar), all corners rounded.
          // `border-l-0` drops the unprefixed `border-l` above, which is meant for right-side drawers.
          isFloating &&
            'overflow-hidden border-l-0 data-[vaul-drawer-direction=bottom]:inset-x-2 data-[vaul-drawer-direction=bottom]:bottom-[calc(8px+env(safe-area-inset-bottom))] data-[vaul-drawer-direction=bottom]:rounded-[32px]',
          className
        )}
        ref={ref}
        {...props}
      >
        {showSwipeHandle && (
          <DrawerPrimitive.Handle className="!mt-3 !h-[6px] !w-[48px] shrink-0 !rounded-[3px] !bg-dark-200 !opacity-100 dark:!bg-light-700" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description className={cn('text-s text-muted-foreground', className)} ref={ref} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
