import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Loading pattern (DECISIONS §2, lab /overlays/loading + /tables): first load = skeleton; refetch = keep the previous
 * data, dim it and run a thin bar under the header, both only after 300ms:
 *
 *   const showFetching = useDelayedFlag(isFetching && !isLoading);
 *   <TableHeader>… <TableLoadingRow colSpan={columns} show={showFetching} /></TableHeader>
 *   <TableBody className={dimmed(showFetching)}>…</TableBody>
 */

/** Thin bar with a sweeping segment. Absolutely positioned: put it in a `relative` box (top edge by default). */
export function LoadingBar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-primary/15', className)}
      data-slot="loading-bar"
    >
      <div className="h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite] bg-primary dark:bg-teal-400" />
    </div>
  );
}

/** A zero-height header row that carries the bar right under a table header. */
export function TableLoadingRow({ colSpan, show }: { colSpan: number; show: boolean }) {
  return (
    <tr aria-hidden className="border-0 hover:bg-transparent">
      <th className="relative h-0 p-0" colSpan={colSpan}>
        {show && <LoadingBar />}
      </th>
    </tr>
  );
}

/** Classes that dim content while it refetches. */
export function dimmed(isDimmed: boolean, className?: string) {
  return cn('transition-opacity', isDimmed && 'opacity-50', className);
}

/** Wrapper that dims its content while it refetches (keeps the previous data visible). */
export function Dimmed({
  when,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  when: boolean;
}) {
  return <div aria-busy={when || undefined} className={dimmed(when, className)} {...props} />;
}
