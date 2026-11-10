import clsx from 'clsx';
import { Fragment, useEffect, useRef, useState } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Text } from '@/ui';

import { InfiniteListFooter, type InfinitePagination } from '../layout/InfiniteListFooter';
import { getNextStopId } from '../utils';
import { StopCard, type StopTone } from './StopCard';
import { StopDrawer } from './StopDrawer';

interface StopsTabProps {
  /** Latest first: upcoming stops at the top, then the next stop, then history going back. */
  stops: DriverStop[];
  focusedStopId: string | null;
  pagination: InfinitePagination;
}

/**
 * The next stop sticks to whichever edge it would scroll past: below the fixed header while the driver looks back
 * into history, above the tab bar (60px + its 1px border) while they look ahead. Its parent must be the whole list,
 * or it would let go at the end of a smaller wrapper.
 */
const PINNED_CLASS =
  'sticky top-[52px] bottom-[calc(61px+env(safe-area-inset-bottom))] z-10 -mx-4 bg-dark-50 px-4 dark:bg-light-900';
// Gap between cards; the pinned one keeps it on both sides, so it never touches the header or the tab bar.
const ITEM_CLASS = 'py-1';

export const StopsTab: React.FC<StopsTabProps> = ({ stops, focusedStopId, pagination }) => {
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
      {stops.map((stop) => {
        const isNext = stop.id === nextStopId;
        const tone: StopTone = isNext ? 'next' : stop.completedAt ? 'completed' : 'default';

        return (
          <Fragment key={stop.id}>
            <Box data-stop-anchor={stop.id} />
            <Box className={clsx(ITEM_CLASS, isNext && PINNED_CLASS)}>
              <StopCard
                isHighlighted={stop.id === highlightedStopId}
                stop={stop}
                tone={tone}
                onOpen={() => openStop(stop.id)}
              />
            </Box>
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
