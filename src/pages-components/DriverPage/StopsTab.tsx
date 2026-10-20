import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { CompleteStopButton } from './CompleteStopButton';
import { StickySectionHeader } from './StickySectionHeader';
import { StopCard } from './StopCard';
import { StopDocuments } from './StopDocuments';
import { buildRouteTimeline } from './utils';

interface StopsTabProps {
  stops: DriverStop[];
  focusedStopId: string | null;
}

type DotKind = 'completed' | 'next' | 'upcoming';

const RAIL_LINE_CLASS = 'bg-dark-200 dark:bg-light-800';
// Segment between two completed stops: the part of the route already driven.
const RAIL_LINE_DONE_CLASS = 'bg-teal-600';

const DOT_CLASSES: Record<DotKind, string> = {
  completed: 'size-3 border-2 border-teal-600 bg-teal-600',
  next: 'size-[14px] border-[3px] border-teal-600 bg-white dark:bg-light-900',
  upcoming: 'size-3 border-2 border-dark-300 bg-dark-50 dark:border-light-600 dark:bg-light-900',
};

export const StopsTab: React.FC<StopsTabProps> = ({ stops, focusedStopId }) => {
  const timeline = useMemo(() => buildRouteTimeline(stops, dayjs()), [stops]);

  // Focus is decided once, from the first data the page got; later refetches must not move the driver around.
  const [focusStopId] = useState(() =>
    focusedStopId && stops.some((stop) => stop.id === focusedStopId) ? focusedStopId : null
  );
  const [expandedStopIds, setExpandedStopIds] = useState<Set<string>>(
    () => new Set([focusStopId ?? timeline.nextStopId].filter((id): id is string => Boolean(id)))
  );
  const [isCompletedOpen, setIsCompletedOpen] = useState(() =>
    timeline.completed.some((stop) => stop.id === focusStopId)
  );

  useEffect(() => {
    if (!focusStopId) return;
    document.querySelector(`[data-stop-id="${focusStopId}"]`)?.scrollIntoView({ block: 'center' });
  }, [focusStopId]);

  function toggleStop(stopId: string) {
    setExpandedStopIds((ids) => {
      const next = new Set(ids);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  }

  // The rail runs through day dividers so the active route reads as one line; it only stops at its ends.
  function renderRoute(
    routeStops: DriverStop[],
    { showDate, isRouteStart, isRouteEnd }: { showDate?: boolean; isRouteStart: boolean; isRouteEnd: boolean }
  ) {
    return (
      <FlexLayout className="flex-col">
        {routeStops.map((stop, index) => {
          const isNext = stop.id === timeline.nextStopId;
          const dotKind: DotKind = stop.completedAt ? 'completed' : isNext ? 'next' : 'upcoming';
          const hasLineAbove = index > 0 || !isRouteStart;
          const hasLineBelow = index < routeStops.length - 1 || !isRouteEnd;
          const isDoneAbove = Boolean(stop.completedAt && routeStops[index - 1]?.completedAt);
          const isDoneBelow = Boolean(stop.completedAt && routeStops[index + 1]?.completedAt);

          return (
            <FlexLayout className="gap-3" key={stop.id}>
              <FlexLayout className="w-[14px] shrink-0 flex-col items-center">
                <Box
                  className={clsx(
                    'h-[22px] w-[1px] shrink-0',
                    hasLineAbove && (isDoneAbove ? RAIL_LINE_DONE_CLASS : RAIL_LINE_CLASS)
                  )}
                />
                <Box className={clsx('shrink-0 rounded-circle', DOT_CLASSES[dotKind])} />
                <Box
                  className={clsx(
                    'w-[1px] grow',
                    hasLineBelow && (isDoneBelow ? RAIL_LINE_DONE_CLASS : RAIL_LINE_CLASS)
                  )}
                />
              </FlexLayout>
              <Box className="min-w-0 grow pb-2">
                <StopCard
                  actions={
                    <>
                      <CompleteStopButton stop={stop} />
                      <StopDocuments stop={stop} />
                    </>
                  }
                  isExpanded={expandedStopIds.has(stop.id)}
                  isHighlighted={stop.id === focusStopId}
                  isNext={isNext}
                  showDate={showDate}
                  stop={stop}
                  onToggle={() => toggleStop(stop.id)}
                />
              </Box>
            </FlexLayout>
          );
        })}
      </FlexLayout>
    );
  }

  return (
    <FlexLayout className="flex-col gap-2 px-4 pb-4">
      {timeline.completed.length > 0 && (
        <FlexLayout className="flex-col gap-2">
          <StickySectionHeader isExpanded={isCompletedOpen} onClick={() => setIsCompletedOpen((isOpen) => !isOpen)}>
            <Icon
              color="text-dark-500 dark:text-light-300"
              icon={isCompletedOpen ? 'IconChevronDown' : 'IconChevronRight'}
              size="s"
            />
            <Text color="text-color-3" variant="text-xxs-medium">
              ZAVRŠENO ({timeline.completed.length})
            </Text>
          </StickySectionHeader>
          {isCompletedOpen && renderRoute(timeline.completed, { showDate: true, isRouteStart: true, isRouteEnd: true })}
        </FlexLayout>
      )}
      {!timeline.nextStopId && (
        <Text className="py-8 text-center" color="text-color-3" variant="text-s">
          Nemaš aktivnih postaja.
        </Text>
      )}
      {timeline.days.map((day, dayIndex) => (
        <FlexLayout className="flex-col gap-2" key={day.key}>
          <StickySectionHeader>
            {day.isLate && <Icon color="text-red-600 dark:text-red-400" icon="IconAlertTriangle" size="s" />}
            <Text color={day.isLate ? 'text-red-600 dark:text-red-400' : 'text-color-3'} variant="text-xxs-medium">
              {day.label.toUpperCase()}
            </Text>
          </StickySectionHeader>
          {renderRoute(day.stops, {
            isRouteStart: dayIndex === 0,
            isRouteEnd: dayIndex === timeline.days.length - 1,
          })}
        </FlexLayout>
      ))}
    </FlexLayout>
  );
};
