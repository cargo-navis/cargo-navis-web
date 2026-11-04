import clsx from 'clsx';
import dayjs from 'dayjs';
import { Fragment, useEffect, useRef, useState } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { InfiniteListFooter, type InfinitePagination } from '../layout/InfiniteListFooter';
import { getNextStopId, getStopDayLabel } from '../utils';
import { StopCard, type StopTone } from './StopCard';
import { StopDrawer } from './StopDrawer';

interface StopsTabProps {
  /** Latest first: upcoming stops at the top, then the next stop, then history going back. */
  stops: DriverStop[];
  focusedStopId: string | null;
  pagination: InfinitePagination;
}

type DotKind = 'completed' | 'next' | 'upcoming';

const RAIL_LINE_CLASS = 'bg-dark-200 dark:bg-light-800';
// Segment between two completed stops: the part of the route already driven.
const RAIL_LINE_DONE_CLASS = 'bg-teal-600';

// A completed dot is bigger, to fit its check; RAIL_ABOVE_DOT_CLASSES keeps every dot centered on the card's first line.
const DOT_CLASSES: Record<DotKind, string> = {
  completed: 'flex size-4 items-center justify-center bg-teal-600 text-white',
  next: 'size-[14px] border-[3px] border-teal-600 bg-white dark:bg-light-900',
  upcoming: 'size-3 border-2 border-dark-300 bg-dark-50 dark:border-light-600 dark:bg-light-900',
};

const RAIL_ABOVE_DOT_CLASSES: Record<DotKind, string> = {
  completed: 'h-[20px]',
  next: 'h-[21px]',
  upcoming: 'h-[22px]',
};

/**
 * The next stop sticks to whichever edge it would scroll past: below the fixed header while the driver looks back
 * into history, above the tab bar (60px + its 1px border) while they look ahead. Its parent must be the whole list,
 * or it would let go at the end of a smaller wrapper.
 */
const PINNED_CLASS =
  'sticky top-[52px] bottom-[calc(61px+env(safe-area-inset-bottom))] z-10 -mx-4 bg-dark-50 px-4 dark:bg-light-900';

export const StopsTab: React.FC<StopsTabProps> = ({ stops, focusedStopId, pagination }) => {
  const now = dayjs();
  const nextStopId = getNextStopId(stops);
  // Upcoming stops come first, so the next stop is certain once a completed stop or the end of the list is loaded.
  // Only a route of 20+ upcoming stops needs a second page for it.
  const isNextStopKnown = stops.some((stop) => stop.completedAt) || !pagination.hasNextPage;

  const [highlightedStopId, setHighlightedStopId] = useState<string | null>(null);
  // The drawer keeps the last stop id while closing, so its content doesn't vanish mid-animation.
  const [drawerStopId, setDrawerStopId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerStop = stops.find((stop) => stop.id === drawerStopId) ?? null;

  const { isFetchingNextPage, isFetchNextPageError, fetchNextPage } = pagination;
  useEffect(() => {
    if (!isNextStopKnown && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
  }, [isNextStopKnown, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // Opens on the stop from the link (highlighted), otherwise on the next stop. Decided once, from the first data the
  // tab got; later refetches must not move the driver around.
  const hasFocusedRef = useRef(false);
  useEffect(() => {
    if (hasFocusedRef.current || !isNextStopKnown) return;
    hasFocusedRef.current = true;

    const linkedStopId = focusedStopId && stops.some((stop) => stop.id === focusedStopId) ? focusedStopId : null;
    const stopId = linkedStopId ?? nextStopId;
    setHighlightedStopId(linkedStopId);
    // The anchor stays in the flow; the pinned card itself may be stuck to an edge.
    if (stopId) document.querySelector(`[data-stop-anchor="${stopId}"]`)?.scrollIntoView({ block: 'center' });
  }, [isNextStopKnown, focusedStopId, nextStopId, stops]);

  function openStop(stopId: string) {
    setDrawerStopId(stopId);
    setIsDrawerOpen(true);
  }

  return (
    <FlexLayout className="flex-col px-4 pb-4">
      {!nextStopId && (
        <Text className="py-8 text-center" color="text-color-3" variant="text-s">
          Nemaš aktivnih postaja.
        </Text>
      )}
      {stops.map((stop, index) => {
        const above = stops[index - 1];
        const below = stops[index + 1];
        const isNext = stop.id === nextStopId;
        const tone: StopTone = isNext ? 'next' : stop.completedAt ? 'completed' : 'default';
        const dotKind: DotKind = stop.completedAt ? 'completed' : isNext ? 'next' : 'upcoming';

        const dayLabel = getStopDayLabel(stop, now);
        const showDayLabel = !above || getStopDayLabel(above, now).label !== dayLabel.label;

        // The rail runs through the whole list, and on below the last loaded stop while history has more pages.
        const hasLineAbove = index > 0;
        const hasLineBelow = Boolean(below) || pagination.hasNextPage;
        const isDoneAbove = Boolean(stop.completedAt && above?.completedAt);
        const isDoneBelow = Boolean(stop.completedAt && (below ? below.completedAt : hasLineBelow));
        const lineAboveClass = hasLineAbove && (isDoneAbove ? RAIL_LINE_DONE_CLASS : RAIL_LINE_CLASS);

        const content = (
          <>
            {showDayLabel && (
              <FlexLayout className="gap-3">
                <FlexLayout className="w-4 shrink-0 justify-center">
                  <Box className={clsx('w-[1px]', lineAboveClass)} />
                </FlexLayout>
                <FlexLayout
                  className={clsx(
                    'items-center gap-1 pb-1',
                    index > 0 && 'pt-3',
                    dayLabel.isLate ? 'text-red-600 dark:text-red-400' : 'text-dark-500 dark:text-light-300'
                  )}
                >
                  {dayLabel.isLate && <Icon icon="IconAlertTriangle" size="s" />}
                  <Text color="text-inherit" variant="text-xxs-medium">
                    {dayLabel.label.toUpperCase()}
                  </Text>
                </FlexLayout>
              </FlexLayout>
            )}
            <FlexLayout className="gap-3">
              <FlexLayout className="w-4 shrink-0 flex-col items-center">
                <Box className={clsx('w-[1px] shrink-0', RAIL_ABOVE_DOT_CLASSES[dotKind], lineAboveClass)} />
                <Box className={clsx('shrink-0 rounded-circle', DOT_CLASSES[dotKind])}>
                  {dotKind === 'completed' && <Icon aria-label="Potvrđeno" icon="IconCheck" size="xs" />}
                </Box>
                <Box
                  className={clsx(
                    'w-[1px] grow',
                    hasLineBelow && (isDoneBelow ? RAIL_LINE_DONE_CLASS : RAIL_LINE_CLASS)
                  )}
                />
              </FlexLayout>
              <Box className="min-w-0 grow pb-2">
                <StopCard
                  isHighlighted={stop.id === highlightedStopId}
                  isNext={isNext}
                  stop={stop}
                  tone={tone}
                  onOpen={() => openStop(stop.id)}
                />
              </Box>
            </FlexLayout>
          </>
        );

        return (
          <Fragment key={stop.id}>
            <Box data-stop-anchor={stop.id} />
            {isNext ? <FlexLayout className={clsx('flex-col', PINNED_CLASS)}>{content}</FlexLayout> : content}
          </Fragment>
        );
      })}
      <InfiniteListFooter pagination={pagination} />
      <StopDrawer
        isNext={drawerStop?.id === nextStopId}
        isOpen={isDrawerOpen && !!drawerStop}
        stop={drawerStop}
        onOpenChange={setIsDrawerOpen}
      />
    </FlexLayout>
  );
};
