import clsx from 'clsx';

import type { DriverShipmentSummary } from '@/lib/api/driver';
import { Box, FlexLayout, Skeleton } from '@/ui';

import { isShipmentCompleted } from '../utils';

// Two stops, like a typical order (one loading, one unloading), with slightly different widths (px) so the
// placeholder doesn't read as a column of identical blocks.
const STOPS = [
  { title: 64, street: 150, place: 110, cargos: [210, 150] },
  { title: 56, street: 130, place: 120, cargos: [190, 170] },
];

/** Placeholder for the order sheet header (ShipmentSummary), when the order didn't come from the list. */
export const ShipmentSummarySkeleton = () => (
  <FlexLayout className="flex-col gap-2">
    <Skeleton borderRadius="xs" height={22} width={180} />
    <Skeleton borderRadius="xs" height={12} width={100} />
    <Skeleton borderRadius="xs" height={12} width={160} />
    <Skeleton borderRadius="xs" height={10} width={90} />
  </FlexLayout>
);

/**
 * Placeholder for the order sheet body while the order loads; mirrors ShipmentTimeline and DisponentContact. Stops
 * get a confirm button unless the list summary says the order is completed.
 */
export const ShipmentSheetSkeleton: React.FC<{ summary: DriverShipmentSummary | null }> = ({ summary }) => {
  const hasConfirmButtons = !summary || !isShipmentCompleted(summary);

  return (
    <FlexLayout aria-busy className="flex-col gap-6">
      <FlexLayout className="flex-col">
        {STOPS.map((widths, index) => {
          const isLast = index === STOPS.length - 1;

          return (
            <FlexLayout className="gap-3" key={index}>
              <FlexLayout className="flex-col items-center">
                <Box className="mt-1 size-3 shrink-0 rounded-circle bg-dark-200 dark:bg-light-850" />
                {!isLast && <Box className="w-[1px] grow bg-dark-200 dark:bg-light-800" />}
              </FlexLayout>
              <FlexLayout className={clsx('min-w-0 grow flex-col gap-3', !isLast && 'pb-6')}>
                {/* Kind and date */}
                <FlexLayout className="items-center gap-2">
                  <Skeleton borderRadius="xs" height={14} width={widths.title} />
                  <Skeleton borderRadius="xs" height={12} width={48} />
                </FlexLayout>
                {/* Address with the navigation button */}
                <FlexLayout className="items-start justify-between gap-3">
                  <FlexLayout className="flex-col gap-2 pt-1">
                    <Skeleton borderRadius="xs" height={12} width={widths.street} />
                    <Skeleton borderRadius="xs" height={12} width={widths.place} />
                  </FlexLayout>
                  <Skeleton borderRadius="m" height={44} width={44} />
                </FlexLayout>
                {/* Cargo section: header line and cargo rows */}
                <FlexLayout className="flex-col gap-2">
                  <FlexLayout className="items-center gap-2">
                    <Skeleton borderRadius="xs" height={12} width={90} />
                    <Box className="h-[1px] grow bg-dark-200 dark:bg-light-800" />
                  </FlexLayout>
                  {widths.cargos.map((width) => (
                    <Skeleton borderRadius="xs" height={12} key={width} width={width} />
                  ))}
                </FlexLayout>
                {hasConfirmButtons && <Skeleton borderRadius="m" height={48} width="100%" />}
              </FlexLayout>
            </FlexLayout>
          );
        })}
      </FlexLayout>
      {/* Dispatcher: section line, name and call button */}
      <FlexLayout className="flex-col gap-3">
        <FlexLayout className="items-center gap-2">
          <Skeleton borderRadius="xs" height={12} width={80} />
          <Box className="h-[1px] grow bg-dark-200 dark:bg-light-800" />
        </FlexLayout>
        <Skeleton borderRadius="xs" height={16} width={120} />
        <Skeleton borderRadius="m" height={48} width="100%" />
      </FlexLayout>
    </FlexLayout>
  );
};
