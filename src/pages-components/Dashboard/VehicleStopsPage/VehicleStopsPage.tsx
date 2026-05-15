import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vehicle } from '@/lib/api';
import { useVehicles } from '@/lib/hooks';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Box, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { DispatcherFilter } from './DispatcherFilter';
import { useVehicleStopsFiltersLocalStorage } from './hooks/useVehicleStopsFiltersLocalStorage';
import { VehicleStopCard } from './VehicleStopCard';

export const VehicleStopsPage = () => {
  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle(5);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();

  const [search, setSearch] = useState('');
  const { storage, updateField } = useVehicleStopsFiltersLocalStorage();
  const dispatcherId = storage.dispatcherId;

  const vehicleMap = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle>();
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    const terms = search.trim() ? search.toLowerCase().split(/\s+/) : [];

    return groups.filter((group) => {
      if (dispatcherId && !group.stops.some((s) => s.disponentId === dispatcherId)) return false;
      if (terms.length === 0) return true;

      const vehicle = vehicleMap.get(group.vehicleId);
      if (!vehicle) return false;
      const haystack = `${vehicle.registration} ${vehicle.brand}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [groups, vehicleMap, search, dispatcherId]);

  const isLoading = isLoadingStops || isLoadingVehicles;

  return (
    <DashboardLayout>
      <PageTitle title="Prijevozi" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Prijevozi
        </Heading>
      </Box>

      <FlexLayout className="mt-4 items-end gap-3">
        <Box className="max-w-sm flex-1">
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
        <DispatcherFilter value={dispatcherId} onChange={(v) => updateField('dispatcherId', v)} />
      </FlexLayout>

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
