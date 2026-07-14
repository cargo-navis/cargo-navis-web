import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { getCargoLabel } from '@/lib/utils/cargo';
import { Box, FlexLayout, Icon, LoadingSpinner, Pill, Text } from '@/ui';

import { DashboardCard } from './DashboardCard';

export const TodayStopsCard = () => {
  const { data: groups, isLoading: isLoadingStops } = useVehicleStopsByVehicle();
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const isLoading = isLoadingStops || isLoadingVehicles;

  const registrationById = new Map((vehicles ?? []).map((v) => [v.id, v.registration]));

  const todayStops = (groups ?? [])
    .flatMap((group) => group.stops)
    .filter((stop) => stop.date && dayjs(stop.date).isSame(dayjs(), 'day'));

  return (
    <DashboardCard icon="IconTruckDelivery" iconColor="text-blue-600" title="Današnje stanice">
      {isLoading ? (
        <FlexLayout className="h-full items-center justify-center">
          <LoadingSpinner />
        </FlexLayout>
      ) : todayStops.length === 0 ? (
        <FlexLayout className="h-full items-center justify-center">
          <Text color="text-color-3" variant="text-m">
            Nema stanica za danas
          </Text>
        </FlexLayout>
      ) : (
        <FlexLayout className="h-full flex-col gap-3 overflow-y-auto pr-1">
          {todayStops.map((stop) => (
            <TodayStopRow key={stop.id} registration={registrationById.get(stop.vehicleId)} stop={stop} />
          ))}
          <Text className="text-center" color="text-color-3" variant="text-xs">
            Nema drugih stanica danas
          </Text>
        </FlexLayout>
      )}
    </DashboardCard>
  );
};

const TodayStopRow = ({ stop, registration }: { stop: VehicleStop; registration?: string }) => {
  const { push } = useRouter();
  const actions = [
    ...stop.loadingCargos.map((cargo) => ({ kind: 'loading' as const, cargo })),
    ...stop.unloadingCargos.map((cargo) => ({ kind: 'unloading' as const, cargo })),
  ];

  return (
    <Box
      className="rounded-m border border-dark-200 dark:border-light-800 p-4 transition-colors hover:bg-dark-50 dark:hover:bg-light-800"
      onClick={() => push(`/dashboard/vehicle-stops/${stop.vehicleId}`)}
    >
      <FlexLayout className="items-center gap-2">
        {registration && (
          <FlexLayout className="items-center gap-1 shrink-0 text-dark-800 dark:text-light-50">
            <Icon icon="IconTruck" size="l" />
            <Text as="span" color="text-color-1" variant="text-s-bold">
              {registration}
            </Text>
          </FlexLayout>
        )}
        <Text as="span" color="text-color-3" variant="text-xs">
          ·
        </Text>
        <Text as="span" color="text-color-2" variant="text-s">
          {stop.address?.placeName ?? '-'}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col gap-2 mt-2">
        {actions.length === 0 ? (
          <Text color="text-color-3" variant="text-xxs">
            Nema utovara ni istovara
          </Text>
        ) : (
          actions.map(({ kind, cargo }) => (
            <FlexLayout className="flex-col gap-1" key={kind + cargo.id}>
              <FlexLayout className="items-center gap-2">
                <Pill
                  size="s"
                  text={kind === 'loading' ? 'Utovar' : 'Istovar'}
                  variant={kind === 'loading' ? 'info' : 'warning'}
                />
                <Link
                  className="hover:underline"
                  href={`/dashboard/shipments/${cargo.shipment.id}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Text as="span" color="text-color-2" variant="text-xs-medium">
                    Nalog {cargo.shipment.orderNumber}
                  </Text>
                </Link>
              </FlexLayout>
              <Text as="span" color="text-color-3" variant="text-xs">
                {getCargoLabel(cargo)}
              </Text>
            </FlexLayout>
          ))
        )}
      </FlexLayout>
    </Box>
  );
};
