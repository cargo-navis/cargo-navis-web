import clsx from 'clsx';
import dayjs from 'dayjs';

import { ClientName } from '@/components/clients/ClientName';
import {
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import type { VehicleStop, VehicleStopCargo, VehicleStopCargoShipment } from '@/lib/api/vehicleStops';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, FlexLayout, Icon, Text } from '@/ui';
import { Tooltip } from '@/ui/components/Tooltip/Tooltip';

interface StopTimelineItemProps {
  stop: VehicleStop;
  nextStop?: VehicleStop;
  step: number;
}

type ShipmentKind = 'loading' | 'unloading' | 'both';

interface ShipmentEntry {
  shipment: VehicleStopCargoShipment;
  kind: ShipmentKind;
}

function collectShipments(loadingCargos: VehicleStopCargo[], unloadingCargos: VehicleStopCargo[]): ShipmentEntry[] {
  const map = new Map<string, ShipmentEntry>();
  loadingCargos.forEach((c) => map.set(c.shipment.id, { shipment: c.shipment, kind: 'loading' }));
  unloadingCargos.forEach((c) => {
    const existing = map.get(c.shipment.id);
    map.set(c.shipment.id, {
      shipment: c.shipment,
      kind: existing ? 'both' : 'unloading',
    });
  });
  return Array.from(map.values());
}

const ShipmentPill = ({ shipment, kind }: ShipmentEntry) => {
  const isLoading = kind !== 'unloading';
  const textClass = isLoading ? 'text-orange-400' : 'text-teal-400';

  return (
    <FlexLayout className="items-center gap-1">
      <Icon color={textClass} icon="IconFileDescription" size="s" />
      <Text color={textClass} variant="text-xxs-medium">
        Nalog {shipment.orderNumber}
      </Text>
      {shipment.clientId && (
        <>
          <Text color={textClass} variant="text-xxs">
            ·
          </Text>
          <ClientName color={textClass} id={shipment.clientId} variant="text-xxs" />
        </>
      )}
    </FlexLayout>
  );
};

const StopTooltipContent = ({ stop }: { stop: VehicleStop }) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const shipments = collectShipments(loadingCargos, unloadingCargos);

  return (
    <FlexLayout className="p-2 flex-col gap-1 text-light-50">
      {address && (
        <>
          <Text variant="text-xxs-medium">{address.streetName}</Text>
          <Text variant="text-s">
            {address.postalCode}, {address.placeName}
          </Text>
        </>
      )}
      {date && (
        <Text as="span" color="text-color-4" variant="text-xxs">
          {dayjs(date).format('DD.MM.YYYY')}
        </Text>
      )}
      {!date && (
        <Text as="span" className="italic" variant="text-xxs">
          Nije posjećeno
        </Text>
      )}
      {(loadingCargos.length > 0 || unloadingCargos.length > 0) && (
        <FlexLayout className="items-center gap-1">
          {loadingCargos.length > 0 && (
            <Text as="span" className="text-orange-400" variant="text-xs">
              {loadingCargos.length} utovar
            </Text>
          )}
          {loadingCargos.length > 0 && unloadingCargos.length > 0 && (
            <Text as="span" className="text-light-50" variant="text-xs">
              ,
            </Text>
          )}
          {unloadingCargos.length > 0 && (
            <Text as="span" className="text-teal-400" variant="text-xs">
              {unloadingCargos.length} istovar
            </Text>
          )}
        </FlexLayout>
      )}
      {shipments.length > 0 && (
        <FlexLayout className="flex-col items-start gap-1 mt-1">
          {shipments.map((entry) => (
            <ShipmentPill key={entry.shipment.id} {...entry} />
          ))}
        </FlexLayout>
      )}
    </FlexLayout>
  );
};

export const StopTimelineEntry = ({ stop, nextStop, step }: StopTimelineItemProps) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;
  const isCompleted = isStopCompleted(stop);
  const isNextCompleted = nextStop ? isStopCompleted(nextStop) : true;

  return (
    <TimelineItem
      completed={isCompleted}
      separatorActive={isNextCompleted}
      step={step}
      style={{ paddingRight: '32px', isolation: 'isolate' }}
    >
      <TimelineHeader>
        <TimelineSeparator
          className={isNextCompleted ? undefined : 'bg-transparent'}
          style={{
            top: '28px',
            height: '2px',
            width: 'calc(100% - 20px)',
            transform: 'translateX(18px) translateY(-50%)',
            ...(isNextCompleted
              ? {}
              : {
                  backgroundImage:
                    'repeating-linear-gradient(to right, rgb(19 148 159 / 0.3) 0 5px, transparent 5px 9px)',
                }),
          }}
        />
        <TimelineDate style={{ marginBottom: '20px' }}>
          {date ? (
            dayjs(date).format('DD.MM.YYYY')
          ) : (
            <Box as="span" className="text-red-700 italic">
              Datum nedostaje
            </Box>
          )}
        </TimelineDate>
        <TimelineTitle>
          <Text as="span" className="inline-flex items-center gap-1" color="text-color-1" variant="text-s-medium">
            {address?.placeName ?? '-'}
            {hasLoading && <Icon className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
            {hasUnloading && <Icon className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
          </Text>
        </TimelineTitle>
        <Tooltip content={<StopTooltipContent stop={stop} />} isPortal>
          <TimelineIndicator
            className={clsx(
              'z-10 cursor-default',
              isCompleted && 'flex items-center justify-center bg-teal-500 text-white'
            )}
            style={{ top: '28px', left: 0, transform: 'translateY(-50%)' }}
            onClick={(e) => e.preventDefault()}
          >
            {isCompleted && (
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
            )}
          </TimelineIndicator>
        </Tooltip>
      </TimelineHeader>
      <TimelineContent>
        <Text color="text-color-3" variant="text-xxxs">
          {address?.streetName}
        </Text>
      </TimelineContent>
    </TimelineItem>
  );
};
