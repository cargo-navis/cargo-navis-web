import dayjs from 'dayjs';
import Link from 'next/link';

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
import type { VehicleStop, VehicleStopCargo } from '@/lib/api/vehicleStops';
import { getCargoLabel } from '@/lib/utils/cargo';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

interface ShipmentVehicleStopsProps {
  stops: VehicleStop[];
}

export const ShipmentVehicleStops = ({ stops }: ShipmentVehicleStopsProps) => {
  if (stops.length === 0) return null;

  const vehicleId = stops[0].vehicleId;
  const orderedStops = [...stops].reverse();

  return (
    <FlexLayout className="flex-col gap-3">
      <FlexLayout className="items-center justify-between">
        <Text color="text-color-2" variant="text-s-medium">
          Tijek prijevoza
        </Text>
        <Link
          className="flex items-center gap-1 text-teal-500 hover:text-teal-700 transition-colors"
          href={`/dashboard/vehicle-stops/${vehicleId}`}
        >
          <Text as="span" color="text-inherit" variant="text-xxs-medium">
            Otvori detalje
          </Text>
          <Icon icon="IconArrowRight" size="s" />
        </Link>
      </FlexLayout>
      <Timeline className="w-full" defaultValue={orderedStops.length} orientation="vertical">
        {orderedStops.map((stop, i) => (
          <SidebarStopEntry key={stop.id} step={i + 1} stop={stop} />
        ))}
      </Timeline>
    </FlexLayout>
  );
};

const SidebarStopEntry = ({ stop, step }: { stop: VehicleStop; step: number }) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;
  const hasTooltip = hasLoading || hasUnloading;

  const rowContent = (
    <Box className="flex flex-col gap-0.5">
      <TimelineDate style={{ marginBottom: 2 }}>
        {date ? (
          dayjs(date).format('DD.MM.YYYY')
        ) : (
          <Box as="span" className="text-red-600 italic">
            Datum nedostaje
          </Box>
        )}
      </TimelineDate>
      <TimelineTitle>
        <FlexLayout className="items-center gap-1">
          <Text as="span" color="text-color-1" variant="text-xs-medium">
            {address?.placeName ?? '-'}
          </Text>
          {hasLoading && <Icon className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
          {hasUnloading && <Icon className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
        </FlexLayout>
      </TimelineTitle>
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
    </Box>
  );

  return (
    <TimelineItem completed separatorActive step={step} style={{ paddingLeft: '24px', paddingBottom: '20px' }}>
      <TimelineHeader>
        <TimelineSeparator
          style={{
            left: '5px',
            top: '20px',
            height: 'calc(100% - 12px)',
            width: '2px',
          }}
        />
        <TimelineIndicator style={{ top: 6, left: 0, width: 12, height: 12 }} />
      </TimelineHeader>
      {hasTooltip ? (
        <Tooltip
          content={<StopCargoTooltip loadingCargos={loadingCargos} unloadingCargos={unloadingCargos} />}
          isPortal
        >
          {rowContent}
        </Tooltip>
      ) : (
        rowContent
      )}
    </TimelineItem>
  );
};

const StopCargoTooltip = ({
  loadingCargos,
  unloadingCargos,
}: {
  loadingCargos: VehicleStopCargo[];
  unloadingCargos: VehicleStopCargo[];
}) => (
  <FlexLayout className="flex-col gap-2 p-2 text-light-50">
    {loadingCargos.length > 0 && (
      <CargoListSection color="text-orange-300" icon="IconPackageImport" label="Utovar" cargos={loadingCargos} />
    )}
    {unloadingCargos.length > 0 && (
      <CargoListSection color="text-teal-300" icon="IconPackageExport" label="Istovar" cargos={unloadingCargos} />
    )}
  </FlexLayout>
);

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
