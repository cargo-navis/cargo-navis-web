'use client';

/**
 * Decided (KAN-55, /overlays/toast): tinted by type (soft background like the alerts), icon on the first text line,
 * 448px, success / info / warning 4 s, errors 8 s (hover pauses), × always. Dashboard top-center (where users look
 * on big screens, like today), driver portal bottom-center above the nav: `<Toaster position>`.
 */

import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

const toastManager = ToastPrimitive.createToastManager();

const TIMEOUT = { default: 4000, error: 8000 };

/** Same API as Base UI's manager; errors default to 8 s instead of 4 s. */
const toast: typeof toastManager = {
  ...toastManager,
  add: (options) => toastManager.add({ timeout: options.type === 'error' ? TIMEOUT.error : undefined, ...options }),
};

type ToastPosition = 'top-center' | 'bottom-center';
const ToastPositionContext = React.createContext<ToastPosition>('top-center');

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

const VIEWPORT: Record<ToastPosition, string> = {
  'top-center': 'top-5',
  // Driver portal: above the bottom nav (today 76px).
  'bottom-center': 'bottom-[calc(5rem+env(safe-area-inset-bottom))]',
};

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  const position = React.useContext(ToastPositionContext);
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'pointer-events-none fixed inset-x-4 z-50 mx-auto w-auto max-w-md outline-none',
        VIEWPORT[position],
        className
      )}
      data-slot="toast-viewport"
      {...props}
    />
  );
}

// The stack: newest in front, older ones peek out behind it (away from the screen edge), spread on hover.
const ROOT_SHARED =
  "group/toast pointer-events-auto absolute right-0 z-[calc(1000-var(--toast-index))] w-full rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] h-(--height) [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms] data-expanded:h-(--toast-height) data-limited:opacity-0 after:absolute after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']";

const ROOT_POSITION: Record<ToastPosition, string> = {
  'bottom-center':
    'bottom-0 origin-bottom [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-starting-style:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)] data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] after:top-full',
  'top-center':
    'top-0 origin-top [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-starting-style:[transform:translateY(-150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)] data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] after:bottom-full',
};

// Tinted by type; loading and untyped toasts stay neutral.
const ROOT_TONE =
  'data-[type=success]:border-green-200 data-[type=success]:bg-green-50 dark:data-[type=success]:border-green-900 dark:data-[type=success]:bg-green-950 data-[type=info]:border-blue-200 data-[type=info]:bg-blue-50 dark:data-[type=info]:border-blue-900 dark:data-[type=info]:bg-blue-950 data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50 dark:data-[type=warning]:border-amber-900 dark:data-[type=warning]:bg-amber-950 data-[type=error]:border-red-200 data-[type=error]:bg-red-50 dark:data-[type=error]:border-red-900 dark:data-[type=error]:bg-red-950';

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  const position = React.useContext(ToastPositionContext);
  return (
    <ToastPrimitive.Root
      className={cn(ROOT_SHARED, ROOT_POSITION[position], ROOT_TONE, className)}
      data-slot="toast"
      swipeDirection={position === 'top-center' ? ['up', 'left', 'right'] : ['down', 'left', 'right']}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      className={cn(
        // Start-aligned: the icon sits on the first text line, buttons at the top (one line looks centred).
        'flex h-full items-start gap-3 overflow-hidden px-4 py-3 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
        className
      )}
      data-slot="toast-content"
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title className={cn('text-sm font-medium', className)} data-slot="toast-title" {...props} />;
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="toast-description"
      {...props}
    />
  );
}

function ToastAction({
  className,
  // Touch screens (driver portal): 40px, like the current app's toast undo button.
  render = (
    <Button
      className="bg-background pointer-coarse:h-10 pointer-coarse:px-3 pointer-coarse:text-sm"
      size="sm"
      variant="outline"
    />
  ),
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action className={cn('shrink-0', className)} data-slot="toast-action" render={render} {...props} />
  );
}

function ToastClose({
  className,
  children,
  render = <Button size="icon-sm" variant="ghost" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      aria-label="Zatvori"
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      data-slot="toast-close"
      render={render}
      {...props}
    >
      {children ?? <Icon icon="IconX" size="s" />}
    </ToastPrimitive.Close>
  );
}

const TOAST_ICONS: Record<string, { icon: IconType; className: string }> = {
  success: { icon: 'IconCircleCheck', className: 'text-green-600 dark:text-green-400' },
  info: { icon: 'IconInfoCircle', className: 'text-blue-600 dark:text-blue-400' },
  warning: { icon: 'IconAlertTriangle', className: 'text-amber-600 dark:text-amber-400' },
  error: { icon: 'IconAlertOctagon', className: 'text-red-600 dark:text-red-400' },
  loading: { icon: 'IconLoader', className: 'animate-spin text-muted-foreground' },
};

function ToastIcon({ type }: { type: string | undefined }) {
  const entry = type ? TOAST_ICONS[type] : undefined;
  if (!entry) {
    return null;
  }
  // mt-1.5: centred on the first line of the text block below (20px line inside 6px padding).
  return <Icon className={cn('mt-1.5 shrink-0', entry.className)} data-slot="toast-icon" icon={entry.icon} size="m" />;
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        {/* py-1.5: the first line lines up with the 32px action / close buttons. */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager: manager = toastManager,
  position = 'top-center',
  timeout = TIMEOUT.default,
  limit = 3,
  ...props
}: ToastPrimitive.Provider.Props & { position?: ToastPosition }) {
  return (
    <ToastPositionContext.Provider value={position}>
      <ToastProvider limit={limit} timeout={timeout} toastManager={manager} {...props}>
        {children}
        <ToastPortal>
          <ToastViewport>
            <ToastList />
          </ToastViewport>
        </ToastPortal>
      </ToastProvider>
    </ToastPositionContext.Provider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  createToastManager,
  Toast,
  toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
};
