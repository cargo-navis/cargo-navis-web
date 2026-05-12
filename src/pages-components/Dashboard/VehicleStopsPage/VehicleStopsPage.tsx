import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vehicle } from '@/lib/api';
import { useVehicles } from '@/lib/hooks';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Box, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { VehicleStopCard } from './VehicleStopCard';

export const VehicleStopsPage = () => {
  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle(5);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();

  const [search, setSearch] = useState('');

  const vehicleMap = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle>();
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!search.trim()) return groups;

    const terms = search.toLowerCase().split(/\s+/);
    return groups.filter((group) => {
      const vehicle = vehicleMap.get(group.vehicleId);
      if (!vehicle) return false;
      const haystack = `${vehicle.registration} ${vehicle.brand}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [groups, vehicleMap, search]);

  const isLoading = isLoadingStops || isLoadingVehicles;

  return (
    <DashboardLayout>
      <PageTitle title="Prijevozi" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Prijevozi
        </Heading>
      </Box>

      <Box className="mt-4 max-w-sm">
        <TextInput
          autoFocus
          iconLeft="IconSearch"
          iconRight={search ? 'IconX' : undefined}
          placeholder="Pretraži po registraciji ili marki..."
          value={search}
          onChange={setSearch}
          onClickIconRight={() => setSearch('')}
        />
      </Box>

      {isLoading ? (
        <FlexLayout className="flex-col gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box className="space-y-3" key={i}>
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </Box>
          ))}
        </FlexLayout>
      ) : !filteredGroups.length ? (
        <Text as="p" className="mt-6" color="text-[hsl(var(--muted-foreground))]" variant="text-s">
          Nema podataka o stanicama vozila.
        </Text>
      ) : (
        <FlexLayout className="flex-col gap-4 mt-4">
          {filteredGroups.map((group) => (
            <VehicleStopCard group={group} key={group.vehicleId} vehicle={vehicleMap.get(group.vehicleId) as Vehicle} />
          ))}
        </FlexLayout>
      )}
    </DashboardLayout>
  );
};
