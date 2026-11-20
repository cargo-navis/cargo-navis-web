import { Skeleton } from '@/components/ui/skeleton';
import type { DriverShipmentSummary } from '@/lib/api/driver';
import { cn } from '@/lib/utils';

import { isShipmentCompleted } from '../utils';

// Two stops, like a typical order (one loading, one unloading), with slightly different widths (px) so the
// placeholder doesn't read as a column of identical blocks.
const STOPS = [
  { title: 150, street: 150, place: 110, company: 170, cargos: [210, 150] },
  { title: 130, street: 130, place: 120, company: 150, cargos: [190, 170] },
];

const SectionLine: React.FC<{ width: number }> = ({ width }) => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-3" style={{ width }} />
    <div className="h-px grow bg-border" />
  </div>
);

/** Placeholder for the order drawer header, when the order didn't come from the list. */
export const ShipmentSummarySkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-7 w-48" />
    <Skeleton className="h-4 w-56" />
  </div>
);

/**
 * Placeholder for the order drawer body while the order loads; mirrors ShipmentTimeline and DisponentContact. Stops
 * get a confirm button unless the list summary says the order is completed.
 */
export const ShipmentSheetSkeleton: React.FC<{ summary: DriverShipmentSummary | null }> = ({ summary }) => {
  const hasConfirmButtons = !summary || !isShipmentCompleted(summary);

  return (
    <div aria-busy className="flex flex-col gap-8">
      <div className="flex flex-col">
        {STOPS.map((widths, index) => {
          const isLast = index === STOPS.length - 1;

          return (
            <div className="flex gap-3" key={index}>
              <div className="flex flex-col items-center">
                <div className="mt-1 size-3 shrink-0 rounded-full bg-muted" />
                {!isLast && <div className="w-px grow bg-border" />}
              </div>
              <div className={cn('flex min-w-0 grow flex-col gap-3', !isLast && 'pb-8')}>
                {/* Kind, place and date */}
                <Skeleton className="h-4" style={{ width: widths.title }} />
                {/* Cargo section: title line, company, order, cargo rows */}
                <div className="flex flex-col gap-2">
                  <SectionLine width={64} />
                  <Skeleton className="h-4" style={{ width: widths.company }} />
                  {widths.cargos.map((width) => (
                    <Skeleton className="h-3" key={width} style={{ width }} />
                  ))}
                </div>
                {/* Address with the map button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 pt-1">
                    <Skeleton className="h-3" style={{ width: widths.street }} />
                    <Skeleton className="h-3" style={{ width: widths.place }} />
                  </div>
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                </div>
                {hasConfirmButtons && <Skeleton className="h-12 w-full rounded-lg" />}
              </div>
            </div>
          );
        })}
      </div>
      {/* Dispatcher: section line, name and call button */}
      <div className="flex flex-col gap-3">
        <SectionLine width={80} />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};
