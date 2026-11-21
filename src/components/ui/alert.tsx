'use client';

/**
 * Decided (KAN-55, /overlays/alert): soft tint with a 1px border one step darker, normal text colour (title medium,
 * description muted under a title), icon by tone unless `icon` overrides it (`icon={false}` hides it), icon on the
 * first text line, sizes sm (driver stop notes, dense forms) and default, buttons below the text (`AlertAction`), ×
 * only when `onClose` is passed (hints, never real problems).
 *
 * Banner: account / app-level message at the top of the content card, above the page title, one at a time.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

const alertVariants = cva(
  'group/alert relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm data-[size=sm]:gap-2 data-[size=sm]:px-3 data-[size=sm]:py-2 data-[size=sm]:text-[0.8125rem]',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted/60',
        info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
        success: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
        warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
        destructive: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>;

const TONE: Record<AlertVariant, { icon: IconType; className: string }> = {
  default: { icon: 'IconInfoCircle', className: 'text-muted-foreground' },
  info: { icon: 'IconInfoCircle', className: 'text-blue-600 dark:text-blue-400' },
  success: { icon: 'IconCircleCheck', className: 'text-green-600 dark:text-green-400' },
  warning: { icon: 'IconAlertTriangle', className: 'text-amber-600 dark:text-amber-400' },
  destructive: { icon: 'IconAlertOctagon', className: 'text-red-600 dark:text-red-400' },
};

function Alert({
  className,
  variant = 'default',
  size = 'default',
  icon,
  onClose,
  children,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & {
    size?: 'sm' | 'default';
    /** Overrides the tone's icon; `false` hides it. */
    icon?: IconType | false;
    /** Shows × (for hints only). */
    onClose?(): void;
  }) {
  const tone = TONE[variant ?? 'default'];
  const iconName = icon === false ? null : (icon ?? tone.icon);
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-size={size}
      data-slot="alert"
      role="alert"
      {...props}
    >
      {/* On the first text line: 20px line and icon (sm: 20px line, 16px icon, 2px down). */}
      {iconName && (
        <Icon
          className={cn('shrink-0', size === 'sm' && 'mt-0.5', tone.className)}
          icon={iconName}
          size={size === 'sm' ? 's' : 'm'}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
      {onClose && (
        <Button
          aria-label="Zatvori"
          className="-my-0.5 -mr-1 text-muted-foreground"
          size="icon-xs"
          variant="ghost"
          onClick={onClose}
        >
          <Icon icon="IconX" size="xs" />
        </Button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-medium [&_a]:underline [&_a]:underline-offset-3', className)}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'text-pretty [[data-slot=alert-title]~&]:text-muted-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2',
        className
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

/** Buttons below the text. Outline buttons get a solid background so they don't take the tint. */
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-2 flex flex-wrap items-center gap-2 [&>[data-variant=outline]]:bg-background', className)}
      data-slot="alert-action"
      {...props}
    />
  );
}

function Banner({
  className,
  variant = 'warning',
  icon,
  onClose,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: AlertVariant;
  icon?: IconType | false;
  onClose?(): void;
}) {
  const tone = TONE[variant];
  const iconName = icon === false ? null : (icon ?? tone.icon);
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b px-4 py-2 text-sm [&_[data-variant=outline]]:bg-background',
        alertVariants({ variant }),
        'rounded-none border-x-0 border-t-0',
        className
      )}
      data-slot="banner"
      role="status"
      {...props}
    >
      {iconName && <Icon className={cn('shrink-0', tone.className)} icon={iconName} size="s" />}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">{children}</div>
      {onClose && (
        <Button aria-label="Zatvori" size="icon-xs" variant="ghost" onClick={onClose}>
          <Icon icon="IconX" size="xs" />
        </Button>
      )}
    </div>
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, Banner };
