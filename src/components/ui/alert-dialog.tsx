'use client';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { PHONE_SHEET } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/40 duration-100 dark:bg-black/60 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className
      )}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  );
}

/**
 * Decided (KAN-55, /overlays/confirm): Dialog's shell (40% backdrop, top 12vh, 24px padding, 18px title, grey footer
 * strip), 448px wide, text left, ghost Odustani, focus on Odustani so Enter never deletes (pass `initialFocus` to
 * focus the action on non-destructive confirms). Outside click does nothing (Base UI default for alert dialogs).
 */
function AlertDialogContent({
  className,
  size = 'default',
  overlayClassName,
  initialFocus,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: 'default' | 'sm';
  overlayClassName?: string;
}) {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const focusCancel = React.useCallback(
    () => popupRef.current?.querySelector<HTMLElement>('[data-cancel]') ?? true,
    []
  );
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay className={overlayClassName} />
      <AlertDialogPrimitive.Popup
        className={cn(
          'group/alert-dialog-content fixed top-[12vh] left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 gap-4 rounded-xl bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:sm:max-w-md data-[size=sm]:sm:max-w-xs data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          PHONE_SHEET,
          className
        )}
        data-size={size}
        data-slot="alert-dialog-content"
        initialFocus={initialFocus ?? focusCancel}
        ref={popupRef}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-rows-[auto_1fr] place-items-start gap-1.5 text-left has-data-[slot=alert-dialog-media]:grid-cols-[auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4',
        className
      )}
      data-slot="alert-dialog-header"
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-6 py-4 max-sm:rounded-b-[2rem] group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
        className
      )}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}

function AlertDialogMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        "row-span-2 inline-flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 **:[svg:not([class*='size-'])]:size-5",
        className
      )}
      data-slot="alert-dialog-media"
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn(
        'font-heading text-lg leading-snug font-bold tracking-tight group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className
      )}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn(
        'text-sm text-pretty text-muted-foreground group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2 *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className
      )}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button className={cn(className)} data-slot="alert-dialog-action" {...props} />;
}

function AlertDialogCancel({
  className,
  variant = 'ghost',
  size = 'default',
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(className)}
      data-cancel=""
      data-slot="alert-dialog-cancel"
      render={<Button size={size} variant={variant} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
