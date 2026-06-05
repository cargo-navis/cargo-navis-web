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
import { useSendVehicleStopMessage } from '@/lib/hooks';
import { useEmployee } from '@/lib/hooks/api/employees';
import { getCargoLabelParts } from '@/lib/utils/cargo';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, Button, FlexLayout, Icon, Text } from '@/ui';
import { Tooltip } from '@/ui/components/Tooltip/Tooltip';

interface StopTimelineItemProps {
  stop: VehicleStop;
  nextStop?: VehicleStop;
  step: number;
  connectsToMore?: boolean;
}

type CargoKind = 'loading' | 'unloading';

interface CargoEntry {
  cargo: VehicleStopCargo;
  kind: CargoKind;
}

interface ShipmentSection {
  shipment: VehicleStopCargoShipment;
  cargos: CargoEntry[];
}

function buildShipmentSections(
  loadingCargos: VehicleStopCargo[],
  unloadingCargos: VehicleStopCargo[]
): ShipmentSection[] {
  const map = new Map<string, ShipmentSection>();
  const add = (cargo: VehicleStopCargo, kind: CargoKind) => {
    const section = map.get(cargo.shipment.id) ?? { shipment: cargo.shipment, cargos: [] };
    section.cargos.push({ cargo, kind });
    map.set(cargo.shipment.id, section);
  };
  loadingCargos.forEach((c) => add(c, 'loading'));
  unloadingCargos.forEach((c) => add(c, 'unloading'));
  return Array.from(map.values());
}

const ShipmentHeader = ({ shipment }: { shipment: VehicleStopCargoShipment }) => (
  <FlexLayout className="items-center gap-1">
    <Icon color="text-light-50" icon="IconFileDescription" size="s" />
    <Text color="text-light-50" variant="text-xxs-medium">
      Nalog {shipment.orderNumber}
    </Text>
    {shipment.clientId && (
      <>
        <Text color="text-light-300" variant="text-xxs">
          ·
        </Text>
        <ClientName color="text-light-300" id={shipment.clientId} variant="text-xxs" />
      </>
    )}
  </FlexLayout>
);

const CargoLine = ({ cargo, kind }: CargoEntry) => {
  const textClass = kind === 'loading' ? 'text-orange-400' : 'text-teal-400';
  const icon = kind === 'loading' ? 'IconPackageImport' : 'IconPackageExport';
  const { primary, secondary } = getCargoLabelParts(cargo);

  return (
    <FlexLayout className="items-center gap-1 pl-3">
      <Icon color={textClass} icon={icon} size="s" />
      <Text color={textClass} variant="text-xxs-medium">
        {primary}
      </Text>
      {secondary && (
        <Text color="text-light-300" variant="text-xxs">
          ({secondary})
        </Text>
      )}
    </FlexLayout>
  );
};

const ShipmentSectionDisplay = ({ section }: { section: ShipmentSection }) => (
  <FlexLayout className="flex-col items-start gap-0.5">
    <ShipmentHeader shipment={section.shipment} />
    {section.cargos.map(({ cargo, kind }) => (
      <CargoLine cargo={cargo} key={`${cargo.id}-${kind}`} kind={kind} />
    ))}
  </FlexLayout>
);

const MessageStatusTooltipContent = ({ stop }: { stop: VehicleStop }) => {
  const messageSent = !!stop.messageSentAt;
  const { mutateAsync: sendMessage, isPending } = useSendVehicleStopMessage(stop.id);
  const { data: driver } = useEmployee(stop.driverId ?? '');
  const driverName = driver?.fullName ?? '-';

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await sendMessage();
      showSuccessToast({ title: 'Poruka poslana' });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom slanja poruke. Pokušajte ponovno.' });
    }
  }

  return (
    <FlexLayout className="p-2 flex-col gap-2 items-start">
      <Text color="text-light-50" variant="text-xxs">
        {messageSent
          ? `Obavijest poslana: ${dayjs(stop.messageSentAt).format('DD.MM.YYYY, HH:mm')}`
          : 'Obavijest nije poslana.'}
      </Text>
      <Button
        iconLeft="IconBrandWhatsapp"
        isFullWidth
        isLoading={isPending}
        size="s"
        text={messageSent ? `Ponovno obavijesti vozača (${driverName})` : `Obavijesti vozača (${driverName})`}
        type="button"
        variant="secondary"
        onClick={handleClick}
      />
    </FlexLayout>
  );
};

const StopTooltipContent = ({ stop }: { stop: VehicleStop }) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const sections = buildShipmentSections(loadingCargos, unloadingCargos);

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
      {sections.length > 0 && (
        <FlexLayout className="flex-col items-start gap-2 mt-1">
          {sections.map((section) => (
            <ShipmentSectionDisplay key={section.shipment.id} section={section} />
          ))}
        </FlexLayout>
      )}
    </FlexLayout>
  );
};

export const StopTimelineEntry = ({ stop, nextStop, step, connectsToMore = false }: StopTimelineItemProps) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;
  const isCompleted = isStopCompleted(stop);
  const isNextCompleted = nextStop ? isStopCompleted(nextStop) : !connectsToMore;
  const showMessageIndicator = !isCompleted && !!stop.driverId;
  const messageSent = !!stop.messageSentAt;

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
          <Box as="span" className="inline-flex items-center gap-1">
            {date ? (
              dayjs(date).format('DD.MM.YYYY')
            ) : (
              <Box as="span" className="text-red-700 italic">
                Datum nedostaje
              </Box>
            )}
            {showMessageIndicator && (
              <Tooltip content={<MessageStatusTooltipContent stop={stop} />} interactive isPortal>
                <Box as="span" className="inline-flex">
                  <Icon
                    className={messageSent ? 'text-dark-500 dark:text-light-300' : 'text-red-500 dark:text-red-400'}
                    icon="IconBrandWhatsapp"
                    size="s"
                  />
                </Box>
              </Tooltip>
            )}
          </Box>
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

const RemainingStopsTooltipContent = ({ stops }: { stops: VehicleStop[] }) => {
  const ordered = [...stops].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
  return (
    <FlexLayout className="p-2 flex-col gap-5 items-start">
      {ordered.map((s) => {
        const hasLoading = s.loadingCargos.length > 0;
        const hasUnloading = s.unloadingCargos.length > 0;
        return (
          <FlexLayout className="flex-col items-start" key={s.id}>
            <Text className="leading-4" color="text-color-4" variant="text-xxs">
              {s.date ? dayjs(s.date).format('DD.MM.YYYY') : '—'}
            </Text>
            <FlexLayout className="items-center gap-1">
              <Text color="text-light-50" variant="text-xxs-medium">
                {s.address?.placeName ?? '-'}
              </Text>
              {hasLoading && <Icon className="text-orange-400" icon="IconPackageImport" size="s" />}
              {hasUnloading && <Icon className="text-teal-400" icon="IconPackageExport" size="s" />}
            </FlexLayout>
            {s.address && (
              <Text className="leading-3" color="text-light-300" variant="text-xxs">
                {s.address.streetName}, {s.address.postalCode}
              </Text>
            )}
          </FlexLayout>
        );
      })}
    </FlexLayout>
  );
};

interface RemainingStopsBadgeProps {
  count: number;
  step: number;
  stops?: VehicleStop[];
  isNextCompleted?: boolean;
}

export const RemainingStopsBadge = ({ count, step, stops, isNextCompleted }: RemainingStopsBadgeProps) => {
  const tooltipContent = stops && stops.length > 0 ? <RemainingStopsTooltipContent stops={stops} /> : undefined;
  const showSeparator = isNextCompleted !== undefined;

  const indicator: React.ReactElement = (
    <TimelineIndicator
      className="z-10 cursor-default flex items-center justify-center bg-teal-50 dark:bg-teal-900/40 border-teal-500/50 text-teal-700 dark:text-teal-200"
      style={{
        top: '28px',
        left: 0,
        transform: 'translateY(-50%)',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
      }}
      onClick={(e) => e.preventDefault()}
    >
      <Text variant="text-xxs-medium">+{count}</Text>
    </TimelineIndicator>
  );

  return (
    <TimelineItem
      separatorActive={isNextCompleted}
      step={step}
      style={{ flex: 'none', width: '60px', isolation: 'isolate' }}
    >
      <TimelineHeader>
        {showSeparator && (
          <TimelineSeparator
            className={isNextCompleted ? undefined : 'bg-transparent'}
            style={{
              top: '28px',
              height: '2px',
              width: 'calc(100% - 40px)',
              transform: 'translateX(38px) translateY(-50%)',
              ...(isNextCompleted
                ? {}
                : {
                    backgroundImage:
                      'repeating-linear-gradient(to right, rgb(19 148 159 / 0.3) 0 5px, transparent 5px 9px)',
                  }),
            }}
          />
        )}
        <Box style={{ height: '20px', marginBottom: '20px' }} />
        {tooltipContent ? (
          <Tooltip content={tooltipContent} isPortal>
            {indicator}
          </Tooltip>
        ) : (
          indicator
        )}
      </TimelineHeader>
    </TimelineItem>
  );
};
