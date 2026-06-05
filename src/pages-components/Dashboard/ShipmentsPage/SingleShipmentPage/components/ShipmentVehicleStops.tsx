import dayjs from 'dayjs';
import Link from 'next/link';

import { EmployeeName } from '@/components/employees/EmployeeName';
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import { ToggleStopCompletionButton } from '@/components/vehicleStops/ToggleStopCompletionButton';
import type { VehicleStop, VehicleStopCargo } from '@/lib/api/vehicleStops';
import { useVehicles } from '@/lib/hooks';
import { getCargoLabel } from '@/lib/utils/cargo';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

interface ShipmentVehicleStopsProps {
  stops: VehicleStop[];
}

export const ShipmentVehicleStops = ({ stops }: ShipmentVehicleStopsProps) => {
  if (stops.length === 0) return null;

  const latestStop = stops[0];
  const headerVehicleId = stops[0].vehicleId;
  const { data: vehicles } = useVehicles();
  const vehicleById = new Map((vehicles ?? []).map((v) => [v.id, v]));

  const uniqueVehicleIds = new Set(stops.map((s) => s.vehicleId));
  const uniqueDriverIds = new Set(stops.map((s) => s.driverId).filter((id): id is string => Boolean(id)));
  const isMixed = uniqueVehicleIds.size > 1 || uniqueDriverIds.size > 1;

  const headerVehicle = vehicleById.get(headerVehicleId);

  return (
    <FlexLayout className="flex-col gap-3">
      <FlexLayout className="flex-col gap-1">
        <FlexLayout className="items-center justify-between gap-2">
          <Text color="text-color-2" variant="text-s-medium">
            Tijek prijevoza
          </Text>
          {!isMixed && <OpenDetailsLink vehicleId={headerVehicleId} />}
        </FlexLayout>
        {!isMixed && (
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            {headerVehicle?.registration && (
              <FlexLayout className="items-center gap-1">
                <Icon icon="IconTruck" size="s" />
                <Text as="span" color="text-inherit" variant="text-xxs">
                  {headerVehicle.registration}
                </Text>
              </FlexLayout>
            )}
            {latestStop?.driverId && (
              <>
                <Text as="span" color="text-inherit" variant="text-xxs">
                  •
                </Text>
                <FlexLayout className="items-center gap-1">
                  <Icon icon="IconSteeringWheel" size="s" />
                  <EmployeeName color="text-inherit" id={latestStop.driverId} variant="text-xxs" />
                </FlexLayout>
              </>
            )}
          </FlexLayout>
        )}
      </FlexLayout>
      <Timeline className="w-full pt-5" defaultValue={stops.length} orientation="vertical">
        {stops.map((stop, i) => (
          <SidebarStopEntry
            isCompleted={isStopCompleted(stop)}
            key={stop.id}
            registration={vehicleById.get(stop.vehicleId)?.registration}
            showAssignment={isMixed}
            step={i + 1}
            stop={stop}
          />
        ))}
      </Timeline>
    </FlexLayout>
  );
};

const OpenDetailsLink = ({ vehicleId }: { vehicleId: string }) => (
  <Link
    className="flex items-center gap-1 text-teal-500 hover:text-teal-700 transition-colors shrink-0"
    href={`/dashboard/vehicle-stops/${vehicleId}`}
  >
    <Text as="span" color="text-inherit" variant="text-xxs-medium">
      Otvori detalje
    </Text>
    <Icon icon="IconArrowRight" size="s" />
  </Link>
);

const SidebarStopEntry = ({
  stop,
  step,
  showAssignment,
  registration,
  isCompleted,
}: {
  stop: VehicleStop;
  step: number;
  showAssignment: boolean;
  registration?: string;
  isCompleted: boolean;
}) => {
  const { address, date, loadingCargos, unloadingCargos, driverId } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;

  const rowContent = (
    <FlexLayout className="flex-col gap-0.5 relative -top-4">
      <Box className="absolute top-0 right-0">
        <ToggleStopCompletionButton iconOnly stop={stop} />
      </Box>
      <TimelineDate>
        {date ? (
          dayjs(date).format('DD.MM.YYYY')
        ) : (
          <Box as="span" className="text-red-600 italic">
            Datum nedostaje
          </Box>
        )}
      </TimelineDate>
      <Tooltip content={<StopCargoTooltip loadingCargos={loadingCargos} unloadingCargos={unloadingCargos} />} isPortal>
        <TimelineTitle>
          <FlexLayout className="items-center gap-1">
            <Text as="span" color="text-color-1" variant="text-xs-medium">
              {address?.placeName ?? '-'}
            </Text>
            {hasLoading && <Icon className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
            {hasUnloading && <Icon className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
          </FlexLayout>
        </TimelineTitle>
      </Tooltip>
      {address?.postalCode && (
        <Text color="text-color-3" variant="text-xxs">
          {address.postalCode}
        </Text>
      )}
      {address?.streetName && (
        <TimelineContent>
          <Text color="text-color-3" variant="text-xxs">
            {address.streetName}
          </Text>
        </TimelineContent>
      )}
      {showAssignment && (registration || driverId) && (
        <FlexLayout className="flex-col gap-1 mt-1">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            {registration && (
              <FlexLayout className="items-center gap-1">
                <Icon icon="IconTruck" size="s" />
                <Text as="span" color="text-inherit" variant="text-xxs">
                  {registration}
                </Text>
              </FlexLayout>
            )}
            {driverId && (
              <>
                {registration && (
                  <Text as="span" color="text-inherit" variant="text-xxs">
                    •
                  </Text>
                )}
                <FlexLayout className="items-center gap-1">
                  <Icon icon="IconSteeringWheel" size="s" />
                  <EmployeeName color="text-inherit" id={driverId} variant="text-xxs" />
                </FlexLayout>
              </>
            )}
          </FlexLayout>
          <OpenDetailsLink vehicleId={stop.vehicleId} />
        </FlexLayout>
      )}
    </FlexLayout>
  );

  return (
    <TimelineItem
      completed={isCompleted}
      separatorActive={isCompleted}
      step={step}
      style={{ paddingLeft: '24px', paddingBottom: '24px' }}
    >
      <TimelineHeader>
        <TimelineSeparator
          className={isCompleted ? undefined : 'bg-transparent'}
          style={{
            left: '5px',
            top: '20px',
            height: 'calc(100% - 12px)',
            width: '2px',
            ...(isCompleted
              ? {}
              : {
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, rgb(19 148 159 / 0.3) 0 5px, transparent 5px 9px)',
                }),
          }}
        />
        <TimelineIndicator
          className={isCompleted ? 'flex items-center justify-center bg-teal-500 text-white' : undefined}
          style={{ top: 6, left: 0, width: 12, height: 12 }}
        >
          {isCompleted && (
            <svg
              fill="none"
              height="8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 12 12"
              width="8"
            >
              <path d="M2.5 6.5l2.5 2.5 4.5-5" />
            </svg>
          )}
        </TimelineIndicator>
      </TimelineHeader>
      {rowContent}
    </TimelineItem>
  );
};

const StopCargoTooltip = ({
  loadingCargos,
  unloadingCargos,
}: {
  loadingCargos: VehicleStopCargo[];
  unloadingCargos: VehicleStopCargo[];
}) => {
  if (loadingCargos.length === 0 && unloadingCargos.length === 0) {
    return (
      <FlexLayout className="justify-center px-2 py-1">
        <Text color="text-light-50" variant="text-xxs">
          Nema utovara ni istovara na ovoj stanici.
        </Text>
      </FlexLayout>
    );
  }

  return (
    <FlexLayout className="flex-col gap-2 p-2 text-light-50">
      {loadingCargos.length > 0 && (
        <CargoListSection cargos={loadingCargos} color="text-orange-300" icon="IconPackageImport" label="Utovar" />
      )}
      {unloadingCargos.length > 0 && (
        <CargoListSection cargos={unloadingCargos} color="text-teal-300" icon="IconPackageExport" label="Istovar" />
      )}
    </FlexLayout>
  );
};

const CargoListSection = ({
  color,
  icon,
  label,
  cargos,
}: {
  color: string;
  icon: 'IconPackageImport' | 'IconPackageExport';
  label: string;
  cargos: VehicleStopCargo[];
}) => (
  <FlexLayout className="flex-col gap-1">
    <FlexLayout className={`items-center gap-1 ${color}`}>
      <Icon icon={icon} size="s" />
      <Text as="span" color="text-inherit" variant="text-xxs-medium">
        {label}
      </Text>
    </FlexLayout>
    <FlexLayout as="ul" className="flex-col gap-0.5 list-disc list-inside">
      {cargos.map((cargo) => (
        <Text as="li" color="text-light-50" key={cargo.id} variant="text-xxs">
          {getCargoLabel(cargo)}
        </Text>
      ))}
    </FlexLayout>
  </FlexLayout>
);
