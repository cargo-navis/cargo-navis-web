import dayjs from 'dayjs';

import { CountryFlag } from '@/components/shared/country-flag';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import type { DriverShipment, DriverShipmentSummary } from '@/lib/api/driver';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops';
import { useDriverShipment } from '@/lib/hooks/api/driver';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { CompleteStopButton } from '../stops/CompleteStopButton';
import { DisponentContact } from '../stops/DisponentContact';
import { DocumentsIcon } from '../stops/StopCard';
import { StopDetails } from '../stops/StopDetails';
import { StopDocuments } from '../stops/StopDocuments';
import { COMPLETED_CARD, COMPLETED_TEXT, DriverEmpty, keepOpenOnToastPress } from '../ui';
import { formatCompletedAt, formatStopDate, getStopKindLabels, getStopsDisponent, isShipmentCompleted } from '../utils';
import { ShipmentSheetSkeleton, ShipmentSummarySkeleton } from './ShipmentSheetSkeleton';

/** Flag + place. */
const RoutePlace: React.FC<{ address: VehicleStopAddress | null }> = ({ address }) => (
  <span className="inline-flex items-center gap-1.5">
    {address?.countryCode && <CountryFlag code={address.countryCode} size="xxs" />}
    {address?.placeName ?? '-'}
  </span>
);

/** „2/3 mjesta”: confirmed of all utovar / istovar places. */
const formatProgress = ({ completedStopsCount, totalStopsCount }: DriverShipmentSummary) =>
  `${completedStopsCount}/${totalStopsCount} ${plural(totalStopsCount, ['mjesto', 'mjesta', 'mjesta'])}`;

const getShipmentTitle = (shipment: DriverShipmentSummary) => shipment.clientName ?? `Nalog #${shipment.orderNumber}`;

interface ShipmentCardProps {
  shipment: DriverShipmentSummary;
  onOpen(): void;
}

/**
 * An order: client, number, from → to and progress (a dot per stop). A completed order is history, with the same
 * light green card as completed stops in the route and a green title ending in a check.
 */
export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onOpen }) => {
  const isCompleted = isShipmentCompleted(shipment);

  return (
    <Card className={cn('p-0', isCompleted && COMPLETED_CARD)}>
      <button
        aria-haspopup="dialog"
        className={cn('flex w-full flex-col gap-1 p-4 text-left', isCompleted && 'opacity-60')}
        type="button"
        onClick={onOpen}
      >
        <span
          className={cn(
            'flex items-start gap-2 font-heading text-2xl font-bold tracking-tight [overflow-wrap:anywhere]',
            isCompleted && COMPLETED_TEXT
          )}
        >
          <span className="min-w-0">{getShipmentTitle(shipment)}</span>
          {isCompleted && <Icon aria-label="Završen nalog" className="mt-1 shrink-0" icon="IconCircleCheck" size="l" />}
        </span>
        {shipment.clientName && <span className="text-sm text-muted-foreground">Nalog #{shipment.orderNumber}</span>}
        <span className="flex flex-wrap items-center gap-1.5 text-sm text-foreground/80">
          <RoutePlace address={shipment.origin} />
          <Icon className="text-muted-foreground" icon="IconArrowRight" size="s" />
          <RoutePlace address={shipment.destination} />
        </span>
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            {Array.from({ length: shipment.totalStopsCount }, (_, index) => (
              <span
                className={cn(
                  'size-2 rounded-full',
                  index < shipment.completedStopsCount ? 'bg-primary' : 'border border-muted-foreground/40'
                )}
                key={index}
              />
            ))}
          </span>
          <span className="text-[13px] text-muted-foreground">{formatProgress(shipment)}</span>
        </span>
      </button>
    </Card>
  );
};

/** The order's stops on a line: kind, place and day; then the stop's details, confirm or when it was confirmed. */
const ShipmentTimeline: React.FC<{ shipment: DriverShipment }> = ({ shipment }) => (
  <div className="flex flex-col">
    {shipment.stops.map((stop, index) => {
      const isLast = index === shipment.stops.length - 1;
      return (
        <div className="flex gap-3" key={stop.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'mt-1 size-3 shrink-0 rounded-full border-2',
                stop.completedAt ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              )}
            />
            {!isLast && (
              <div
                className={cn(
                  'w-px grow',
                  // Segment between two completed stops: the part of the route already driven.
                  stop.completedAt && shipment.stops[index + 1].completedAt ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
          <div className={cn('flex min-w-0 grow flex-col gap-3', !isLast && 'pb-8')}>
            <span className="text-sm">
              <span className="inline-flex flex-wrap items-center gap-x-1.5 font-medium">
                {getStopKindLabels(stop).title} ·
                {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
                {stop.address?.placeName ?? 'Bez adrese'}
              </span>{' '}
              <span className="text-muted-foreground">{formatStopDate(stop.date, dayjs())}</span>
            </span>
            <StopDetails
              actions={
                <>
                  {stop.completedAt ? (
                    <span className={cn('flex items-center gap-1 text-sm', COMPLETED_TEXT)}>
                      <Icon icon="IconCircleCheck" size="s" />
                      Potvrđeno {formatCompletedAt(stop.completedAt, dayjs())}
                    </span>
                  ) : (
                    <CompleteStopButton stop={stop} />
                  )}
                  <StopDocuments isReadOnly stop={stop} />
                </>
              }
              isInTimeline
              stop={stop}
            />
          </div>
        </div>
      );
    })}
  </div>
);

/** Title, „Nalog #… · from → to” and 📎 when a stop has documents; shared by the loaded order and the list summary. */
const ShipmentDrawerHeader: React.FC<{ shipment: DriverShipmentSummary; hasDocuments?: boolean }> = ({
  shipment,
  hasDocuments,
}) => (
  <>
    <DrawerTitle className="text-2xl [overflow-wrap:anywhere]">{getShipmentTitle(shipment)}</DrawerTitle>
    {/* A div: the 📎 icon is a div too, which a <p> can't hold. */}
    <DrawerDescription className="flex flex-wrap items-center gap-1.5" render={<div />}>
      {[
        shipment.clientName && `Nalog #${shipment.orderNumber}`,
        `${shipment.origin?.placeName ?? '-'} → ${shipment.destination?.placeName ?? '-'}`,
        formatProgress(shipment),
      ]
        .filter(Boolean)
        .join(' · ')}
      {hasDocuments && <DocumentsIcon />}
    </DrawerDescription>
  </>
);

interface ShipmentSheetProps {
  /** Kept set while closing, so the content doesn't vanish during the slide-out. */
  shipmentId: string | null;
  /** The order from the list, shown in the header while its stops load. Missing when a notification opened it. */
  summary: DriverShipmentSummary | null;
  isOpen: boolean;
  onOpenChange(isOpen: boolean): void;
}

/** One order with its stops, loaded by id: the order may not be on a loaded page of the list. */
export const ShipmentSheet: React.FC<ShipmentSheetProps> = ({ shipmentId, summary, isOpen, onOpenChange }) => {
  const { data: shipment, isError, isRefetching, refetch } = useDriverShipment(shipmentId);
  const header = shipment ?? summary;

  function renderContent() {
    if (shipment) {
      return (
        <div className="flex flex-col gap-8">
          <ShipmentTimeline shipment={shipment} />
          <DisponentContact disponent={getStopsDisponent(shipment.stops)} />
        </div>
      );
    }

    if (isError) {
      return (
        <DriverEmpty
          action={
            <Button loading={isRefetching} size="xl" variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconReload" size="m" />
              Pokušaj ponovno
            </Button>
          }
          icon="IconAlertTriangle"
          title="Nalog se nije učitao."
          variant="danger"
        />
      );
    }

    return <ShipmentSheetSkeleton summary={summary} />;
  }

  function renderHeader() {
    if (header) {
      return (
        <ShipmentDrawerHeader
          hasDocuments={shipment?.stops.some((stop) => stop.documents.length > 0)}
          shipment={header}
        />
      );
    }
    // Opened from a notification or link: no list summary to show while the order loads.
    return (
      <>
        <DrawerTitle className="sr-only">Nalog</DrawerTitle>
        {!isError && <ShipmentSummarySkeleton />}
      </>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={keepOpenOnToastPress(onOpenChange)}>
      <DrawerContent>
        <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain">
          {/* No divider: header and body scroll together. */}
          <DrawerHeader className="gap-1.5 p-4 not-last:border-b-0">{renderHeader()}</DrawerHeader>
          <div className="flex flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{renderContent()}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
