import Link from 'next/link';
import * as React from 'react';

import { Timeline } from '@/components/reui/timeline';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Vehicle } from '@/lib/api';
import type { VehicleStopGroup } from '@/lib/api/vehicleStops';
import { FlexLayout, Icon2, Text } from '@/ui';

import { StopTimelineEntry } from './StopItem';

interface VehicleStopCardProps {
  group: VehicleStopGroup;
  vehicle: Vehicle;
}

export const VehicleStopCard = ({ group, vehicle }: VehicleStopCardProps) => {
  const stops = group.stops.slice(-5).reverse();

  return (
    <Link className="block" href={`/dashboard/vehicle-stops/${group.vehicleId}`}>
      <Card className="rounded-m hover:border-teal-500/50 transition-colors cursor-pointer">
        <CardHeader className="p-4 pb-4">
          <FlexLayout className="flex-col">
            <FlexLayout className="items-center gap-2">
              <Text color="text-color-1" variant="text-m-medium">
                {vehicle.registration}
              </Text>
            </FlexLayout>
            <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
              <Icon2 icon="IconTruckDelivery" size="m" />
              <Text variant="text-s">{vehicle.brand}</Text>
            </FlexLayout>
          </FlexLayout>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {stops.length === 0 ? (
            <Text color="text-color-3" variant="text-s">
              Nema stanica za ovo vozilo.
            </Text>
          ) : (
            <Timeline className="w-full" defaultValue={stops.length} orientation="horizontal">
              {stops.map((stop, i) => (
                <StopTimelineEntry key={stop.id} step={i + 1} stop={stop} />
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
