import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import type { Vehicle } from '@/lib/api';
import { useVehicles } from '@/lib/hooks';
import { useEmployees } from '@/lib/hooks/api';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Box, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { DispatcherFilter } from './DispatcherFilter';
import { useVehicleStopsFiltersLocalStorage } from './hooks/useVehicleStopsFiltersLocalStorage';
import { VehicleStopCard } from './VehicleStopCard';

export const VehicleStopsPage = () => {
  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle(5);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();

  const [search, setSearch] = useState('');
  const { storage, updateField } = useVehicleStopsFiltersLocalStorage();
  const dispatcherId = storage.dispatcherId;

  const vehicleMap = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle>();
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    employees?.forEach((e) => map.set(e.id.toString(), e.fullName));
    return map;
  }, [employees]);

  const searchRecords = useMemo(() => {
    if (!groups) return [];
    return groups.map((group) => {
      const driverNames = Array.from(
        new Set(
          group.stops
            .map((s) => (s.driverId ? employeeNameById.get(s.driverId) : undefined))
            .filter(Boolean) as string[]
        )
      );
      return {
        group,
        drivers: driverNames.join(' '),
        registration: vehicleMap.get(group.vehicleId)?.registration ?? '',
      };
    });
  }, [groups, vehicleMap, employeeNameById]);

  const fuse = useMemo(
    () => new Fuse(searchRecords, { keys: ['drivers', 'registration'], threshold: 0.35, ignoreLocation: true }),
    [searchRecords]
  );

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    const dispatcherFiltered = dispatcherId
      ? groups.filter((group) => group.stops.some((s) => s.disponentId === dispatcherId))
      : groups;

    const term = search.trim();
    if (!term) return dispatcherFiltered;

    const allowed = new Set(dispatcherFiltered.map((g) => g.vehicleId));
    return fuse
      .search(term)
      .map((r) => r.item.group)
      .filter((g) => allowed.has(g.vehicleId));
  }, [groups, dispatcherId, search, fuse]);

  const isLoading = isLoadingStops || isLoadingVehicles || isLoadingEmployees;

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
            placeholder="Pretraži po vozaču ili registraciji..."
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
        <FlexLayout className="flex-col mt-4 divide-y divide-dark-200/80 dark:divide-light-800 border-y border-dark-100 dark:border-light-800">
          {filteredGroups.map((group) => (
            <VehicleStopCard group={group} key={group.vehicleId} vehicle={vehicleMap.get(group.vehicleId) as Vehicle} />
          ))}
        </FlexLayout>
      )}
    </DashboardLayout>
  );
};
