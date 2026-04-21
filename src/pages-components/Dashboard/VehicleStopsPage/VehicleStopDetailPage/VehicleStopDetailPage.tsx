import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Timeline } from '@/components/reui/timeline';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicles } from '@/lib/hooks';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';

import { CreateVehicleStopModal } from './CreateVehicleStopModal';
import { VerticalStopEntry } from './VerticalStopEntry';

function sortStops(stops: VehicleStop[]): VehicleStop[] {
  const unvisited = stops.filter((s) => !s.date);
  const visited = stops.filter((s) => s.date).sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  return [...unvisited, ...visited];
}

export const VehicleStopDetailPage = () => {
  const { query } = useRouter();
  const vehicleId = query.vehicleId as string;

  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle();
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();

  const group = useMemo(() => groups?.find((g) => g.vehicleId === vehicleId), [groups, vehicleId]);
  const vehicle = useMemo(() => vehicles?.find((v) => v.id === vehicleId), [vehicles, vehicleId]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedStops = useMemo(() => (group ? sortStops(group.stops) : []), [group]);

  const isLoading = isLoadingStops || isLoadingVehicles;

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingPage />
      </DashboardLayout>
    );
  }

  if (!vehicle || !group) {
    return (
      <DashboardLayout>
        <FlexLayout className="py-5 flex-col gap-5">
          <BackButton targetLocation="/dashboard/vehicle-stops" />
          <Text color="text-color-3" variant="text-s">
            Vozilo nije pronađeno.
          </Text>
        </FlexLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FlexLayout className="py-5 flex-col gap-5">
        <BackButton targetLocation="/dashboard/vehicle-stops" />

        <FlexLayout className="justify-between items-start">
          <Box>
            <Text as="h1" color="text-color-1" variant="text-xl-medium">
              {vehicle.registration}
            </Text>
            <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
              <Icon icon="TruckIcon" size="l" />
              <Text variant="text-m">{vehicle.brand}</Text>
            </FlexLayout>
          </Box>
          <Button iconLeft="PlusIcon" text="Nova stanica" onClick={() => setIsModalOpen(true)} />
        </FlexLayout>

        <Box className="max-w-xl">
          <Timeline className="w-full" defaultValue={0} orientation="vertical">
            {sortedStops.map((stop, i) => {
              const nextStop = sortedStops[i + 1];
              return (
                <VerticalStopEntry
                  completed={!!stop.date}
                  key={stop.id}
                  separatorActive={!!stop.date && !!nextStop?.date}
                  step={i + 1}
                  stop={stop}
                />
              );
            })}
          </Timeline>
        </Box>
      </FlexLayout>

      <CreateVehicleStopModal isOpen={isModalOpen} vehicleId={vehicleId} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};
