import { useMemo } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vehicle } from '@/lib/api';
import { useVehicles } from '@/lib/hooks';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Box, FlexLayout, Heading, Text } from '@/ui';

import { VehicleStopCard } from './VehicleStopCard';

export const VehicleStopsPage = () => {
  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle();
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();

  const vehicleMap = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle>();
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const isLoading = isLoadingStops || isLoadingVehicles;

  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Stanice Vozila
        </Heading>
      </Box>

      {isLoading ? (
        <FlexLayout className="flex-col gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box className="space-y-3" key={i}>
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </Box>
          ))}
        </FlexLayout>
      ) : !groups?.length ? (
        <Text as="p" className="mt-6" color="text-[hsl(var(--muted-foreground))]" variant="text-s">
          Nema podataka o stanicama vozila.
        </Text>
      ) : (
        <FlexLayout className="flex-col gap-4 mt-4">
          {groups.map((group) => (
            <VehicleStopCard group={group} key={group.vehicleId} vehicle={vehicleMap.get(group.vehicleId) as Vehicle} />
          ))}
        </FlexLayout>
      )}
    </DashboardLayout>
  );
};
