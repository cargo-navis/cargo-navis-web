import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Card shell with an optional title row (Sora 16 bold + an action on the right) and a padded body. Labs /order
 * (parts.tsx), /home, /assign, /employees, /partners, /fleet, /settings.
 */
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-xl border bg-card', className)}>
      {title && (
        <div className="flex min-h-12 items-center justify-between gap-2 border-b px-4 py-2">
          <h2 className="font-heading text-base font-bold tracking-tight">{title}</h2>
          {action}
        </div>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
