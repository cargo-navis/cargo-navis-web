'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

// ---------------------------------------------------------------------------------------------------------------------
// Phone (< 640px, DECISIONS §3): every Dialog and AlertDialog is a floating bottom sheet you can swipe down (the
// Drawer: 8px off the edges, 2rem corners, max 80dvh, swipe handle). Same API, the parts switch primitive.
// ---------------------------------------------------------------------------------------------------------------------

const PHONE_QUERY = '(max-width: 639px)';

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** True below 640px (Tailwind `sm`). False on the server. */
export function useIsPhoneSheet() {
  return React.useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false
  );
}

/** Set by Dialog / AlertDialog: their parts render Drawer parts when true. */
export const PhoneSheetContext = React.createContext(false);

/**
 * The sheet's body: Dialog's padding and gap inside the Drawer, scrolls on its own (the footer sticks to the bottom).
 * × stays for parity with desktop; swipe, backdrop tap and Odustani close it too.
 */
export function PhoneSheetContent({
  className,
  children,
  popupClassName,
  overlayClassName,
  closeButton,
  ...props
}: Omit<DrawerPrimitive.Popup.Props, 'className'> & {
  className?: string;
  /** On the sheet itself (className goes on the body inside). */
  popupClassName?: string;
  overlayClassName?: string;
  closeButton?: React.ReactNode;
}) {
  return (
    <DrawerContent className={popupClassName} overlayClassName={overlayClassName} {...props}>
      <div className={cn('grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain px-6 pt-2 pb-6', className)}>
        {children}
      </div>
      {closeButton}
    </DrawerContent>
  );
}

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  const isPhone = useIsPhoneSheet();
  return (
    <PhoneSheetContext.Provider value={isPhone}>
      {isPhone ? (
        <Drawer {...(props as React.ComponentProps<typeof Drawer>)} />
      ) : (
        <DialogPrimitive.Root data-slot="dialog" {...props} />
      )}
    </PhoneSheetContext.Provider>
  );
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  const isPhone = React.useContext(PhoneSheetContext);
  if (isPhone)
    return <DrawerPrimitive.Trigger data-slot="dialog-trigger" {...(props as DrawerPrimitive.Trigger.Props)} />;
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  const isPhone = React.useContext(PhoneSheetContext);
  if (isPhone) return <DrawerPrimitive.Close data-slot="dialog-close" {...(props as DrawerPrimitive.Close.Props)} />;
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/40 duration-100 dark:bg-black/60 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

// Fixed width scale (today's modals: 480, 512, 720, 820 set one by one).
const DIALOG_SIZES = {
  sm: 'sm:max-w-sm', // 384: confirm, 1–2 fields
  md: 'sm:max-w-lg', // 512: short form
  lg: 'sm:max-w-3xl', // 768: two columns, long text
  xl: 'sm:max-w-4xl', // 896: a table inside
} as const;

/**
 * Decided (KAN-55, /overlays/dialog): backdrop 40% (60% dark), top-anchored at 12vh so the title stays put while the
 * form grows, 24px padding, 18px Sora 700 title, grey footer strip, × always shown. Phone: swipeable bottom sheet.
 */
function DialogContent({
  className,
  children,
  size = 'md',
  showCloseButton = true,
  overlayClassName,
  ...props
}: DialogPrimitive.Popup.Props & {
  size?: keyof typeof DIALOG_SIZES;
  showCloseButton?: boolean;
  overlayClassName?: string;
}) {
  const isPhone = React.useContext(PhoneSheetContext);
  const closeButton = showCloseButton && (
    <DialogClose
      data-slot="dialog-close"
      render={<Button className="absolute top-4 right-4" size="icon-sm" variant="ghost" />}
    >
      <Icon icon="IconX" size="s" />
      <span className="sr-only">Zatvori</span>
    </DialogClose>
  );

  if (isPhone) {
    return (
      <PhoneSheetContent
        className={className as string | undefined}
        closeButton={closeButton}
        data-slot="dialog-content"
        overlayClassName={overlayClassName}
        {...(props as Omit<DrawerPrimitive.Popup.Props, 'className'>)}
      >
        {children}
      </PhoneSheetContent>
    );
  }

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Popup
        className={cn(
          'fixed top-[12vh] left-1/2 z-50 grid max-h-[76dvh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 overflow-y-auto rounded-xl bg-popover p-6 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          DIALOG_SIZES[size],
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {closeButton}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} data-slot="dialog-header" {...props} />;
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  const isPhone = React.useContext(PhoneSheetContext);
  return (
    <div
      className={cn(
        '-mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end',
        // Phone: stays in view while the body scrolls; opaque so the body doesn't show through.
        isPhone && 'sticky bottom-0 rounded-b-none bg-[color-mix(in_oklab,var(--muted)_50%,var(--popover))]',
        className
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton && <DialogClose render={<Button variant="outline" />}>Zatvori</DialogClose>}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  const Title = React.useContext(PhoneSheetContext) ? DrawerPrimitive.Title : DialogPrimitive.Title;
  return (
    <Title
      className={cn('font-heading text-lg leading-none font-bold tracking-tight', className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  const Description = React.useContext(PhoneSheetContext) ? DrawerPrimitive.Description : DialogPrimitive.Description;
  return (
    <Description
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className
      )}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
