import Link from 'next/link';
import * as React from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
import { Timeline } from '@/components/reui/timeline';
import type { Vehicle } from '@/lib/api';
import type { VehicleStopGroup } from '@/lib/api/vehicleStops';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { StopTimelineEntry } from './StopItem';

interface VehicleStopCardProps {
  group: VehicleStopGroup;
  vehicle: Vehicle;
}

export const VehicleStopCard = ({ group, vehicle }: VehicleStopCardProps) => {
  const stops = group.stops.slice(-5).reverse();
  const driverIds = Array.from(
    new Set(
      [...stops]
        .reverse()
        .map((s) => s.driverId)
        .filter(Boolean) as string[]
    )
  );

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
                <StopTimelineEntry key={stop.id} nextStop={stops[i + 1]} step={i + 1} stop={stop} />
              ))}
            </Timeline>
          )}
        </Box>
      </FlexLayout>
    </Link>
  );
};
