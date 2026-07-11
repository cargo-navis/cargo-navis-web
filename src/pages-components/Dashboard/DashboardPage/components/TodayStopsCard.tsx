import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useVehicles, useVehicleStopsByVehicle } from '@/lib/hooks';
import { getCargoLabel } from '@/lib/utils/cargo';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

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
    <DashboardCard icon="IconCalendarEvent" title={`Današnje stanice · ${dayjs().format('D. MMM')}`}>
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
        <FlexLayout className="h-full flex-col overflow-y-auto divide-y divide-dark-200 dark:divide-light-800">
          {todayStops.map((stop) => (
            <TodayStopRow key={stop.id} registration={registrationById.get(stop.vehicleId)} stop={stop} />
          ))}
        </FlexLayout>
      )}
    </DashboardCard>
  );
};

const StopStatusCircle = ({ isCompleted }: { isCompleted: boolean }) =>
  isCompleted ? (
    <Box className="flex items-center justify-center w-4 h-4 shrink-0 rounded-circle bg-teal-500 text-white">
      <svg
        fill="none"
        height="10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        viewBox="0 0 12 12"
        width="10"
      >
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
      </svg>
    </Box>
  ) : (
    <Box className="w-4 h-4 shrink-0 rounded-circle border-2 border-dark-300 dark:border-light-600" />
  );

const TodayStopRow = ({ stop, registration }: { stop: VehicleStop; registration?: string }) => {
  const { push } = useRouter();
  const isCompleted = isStopCompleted(stop);
  const actions = [
    ...stop.loadingCargos.map((cargo) => ({ kind: 'loading' as const, cargo })),
    ...stop.unloadingCargos.map((cargo) => ({ kind: 'unloading' as const, cargo })),
  ];

  return (
    <Box
      className="py-3 px-1 transition-colors hover:bg-dark-50 dark:hover:bg-light-800"
      onClick={() => push(`/dashboard/vehicle-stops/${stop.vehicleId}`)}
    >
      <FlexLayout className="items-center gap-2">
        <StopStatusCircle isCompleted={isCompleted} />
        {registration && (
          <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
            <Icon icon="IconTruck" size="s" />
            <Text as="span" color="text-inherit" variant="text-xs-medium">
              {registration}
            </Text>
          </FlexLayout>
        )}
        <Text as="span" color="text-color-1" variant="text-xs-medium">
          {stop.address?.placeName ?? '-'}
        </Text>
      </FlexLayout>
      <FlexLayout className="flex-col gap-1 mt-2">
        {actions.length === 0 ? (
          <Text color="text-color-3" variant="text-xxs">
            Nema utovara ni istovara
          </Text>
        ) : (
          actions.map(({ kind, cargo }) => (
            <FlexLayout className="items-center gap-2" key={kind + cargo.id}>
              <Icon
                className={kind === 'loading' ? 'text-orange-500' : 'text-teal-500'}
                icon={kind === 'loading' ? 'IconPackageImport' : 'IconPackageExport'}
                size="s"
              />
              <Text as="span" color="text-color-2" variant="text-xxs-medium">
                {kind === 'loading' ? 'Utovar' : 'Istovar'}
              </Text>
              <Text as="span" color="text-color-3" variant="text-xxs">
                ·
              </Text>
              <Link
                className="text-teal-500 hover:text-teal-700 hover:underline"
                href={`/dashboard/shipments/${cargo.shipment.id}`}
                onClick={(event) => event.stopPropagation()}
              >
                <Text as="span" color="text-inherit" variant="text-xxs-medium">
                  Nalog {cargo.shipment.orderNumber}
                </Text>
              </Link>
              <Text as="span" color="text-color-3" variant="text-xxs">
                · {getCargoLabel(cargo)}
              </Text>
            </FlexLayout>
          ))
        )}
      </FlexLayout>
    </Box>
  );
};
