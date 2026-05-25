import Link from 'next/link';
import * as React from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
import { Timeline } from '@/components/reui/timeline';
import type { Vehicle } from '@/lib/api';
import type { VehicleStopGroup } from '@/lib/api/vehicleStops';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

import { RemainingStopsBadge, StopTimelineEntry } from './StopItem';

interface VehicleStopCardProps {
  group: VehicleStopGroup;
  vehicle: Vehicle;
}

const TIMELINE_SIZE = 5;

function pickTimelineStops(allStops: VehicleStopGroup['stops']) {
  let lastCompletedIndex = -1;
  for (let i = 0; i < allStops.length; i++) {
    if (isStopCompleted(allStops[i])) lastCompletedIndex = i;
  }

  if (lastCompletedIndex === -1) {
    return allStops.filter((s) => !isStopCompleted(s)).slice(0, TIMELINE_SIZE);
  }

  const result = [allStops[lastCompletedIndex]];
  for (let i = lastCompletedIndex + 1; i < allStops.length && result.length < TIMELINE_SIZE; i++) {
    if (!isStopCompleted(allStops[i])) result.push(allStops[i]);
  }
  for (let i = lastCompletedIndex - 1; i >= 0 && result.length < TIMELINE_SIZE; i--) {
    result.unshift(allStops[i]);
  }
  return result;
}

export const VehicleStopCard = ({ group, vehicle }: VehicleStopCardProps) => {
  const reversedStops = group.stops.toReversed();
  const stops = pickTimelineStops(reversedStops);
  const lastShownIndex = stops.length > 0 ? reversedStops.lastIndexOf(stops[stops.length - 1]) : -1;
  const remainingUncompleted = reversedStops
    .slice(lastShownIndex + 1)
    .reduce((n, s) => n + (isStopCompleted(s) ? 0 : 1), 0);
  const driverIds = Array.from(
    new Set(
      stops
        .toReversed()
        .map((s) => s.driverId)
        .filter(Boolean) as string[]
    )
  );
  const currentDriverId = group.stops.find((s) => s.driverId)?.driverId;

  return (
    <Link
      className="block transition-colors duration-75 hover:bg-dark-50 dark:hover:bg-light-800/50"
      href={`/dashboard/vehicle-stops/${group.vehicleId}`}
    >
      <FlexLayout className="items-start gap-6 px-4 py-6">
        <FlexLayout className="flex-col w-[200px] shrink-0">
          <FlexLayout className="items-center gap-2">
            <Text color="text-color-1" variant="text-l-medium">
              {vehicle.registration}
            </Text>
          </FlexLayout>
          <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
            <Icon icon="IconTruckDelivery" size="m" />
            <Text variant="text-s">{vehicle.brand}</Text>
          </FlexLayout>
          {driverIds.map((id) => (
            <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300" key={id}>
              <Icon icon="IconSteeringWheel" size="s" />
              <EmployeeName id={id} variant="text-xs" />
              {driverIds.length > 1 && id === currentDriverId && (
                <Tooltip
                  content={
                    <FlexLayout className="px-2 flex-col gap-2 items-start">
                      <Text color="text-light-50" variant="text-xxs">
                        Trenutni vozač
                      </Text>
                    </FlexLayout>
                  }
                >
                  <Box className="px-1">•</Box>
                </Tooltip>
              )}
            </FlexLayout>
          ))}
        </FlexLayout>
        <Box className="flex-1 min-w-0">
          {stops.length === 0 ? (
            <Text color="text-color-3" variant="text-s">
              Nema stanica za ovo vozilo.
            </Text>
          ) : (
            <Timeline className="w-full" defaultValue={stops.length} orientation="horizontal">
              {stops.map((stop, i) => (
                <StopTimelineEntry
                  connectsToMore={i === stops.length - 1 && remainingUncompleted > 0}
                  key={stop.id}
                  nextStop={stops[i + 1]}
                  step={i + 1}
                  stop={stop}
                />
              ))}
              {remainingUncompleted > 0 && <RemainingStopsBadge count={remainingUncompleted} step={stops.length + 1} />}
            </Timeline>
          )}
        </Box>
      </FlexLayout>
    </Link>
  );
};
