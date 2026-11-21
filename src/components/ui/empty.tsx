import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Decided (KAN-55, /overlays/empty): icon tile (no emoji), 16px Sora 700 title, sits inside the table under its header,
 * min 320px (≈ 5 rows) so the page keeps its height. With filters: „Očisti filtere” + the active filters as chips;
 * first use: the ways to start; load error: in place with „Pokušaj ponovno”. Small lists (select, ⌘K, popover): one
 * line „Nema rezultata za „…”.” instead of this.
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-h-80 w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance',
        className
      )}
      data-slot="empty"
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex max-w-sm flex-col items-center gap-2', className)} data-slot="empty-header" {...props} />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-5",
        danger:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 [&_svg:not([class*='size-'])]:size-5",
        success:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      className={cn(emptyMediaVariants({ variant, className }))}
      data-slot="empty-icon"
      data-variant={variant}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-heading text-base font-bold tracking-tight', className)}
      data-slot="empty-title"
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      className={cn(
        'text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className
      )}
      data-slot="empty-description"
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance', className)}
      data-slot="empty-content"
      {...props}
    />
  );
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
