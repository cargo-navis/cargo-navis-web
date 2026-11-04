import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverShipment, DriverShipmentSummary } from '@/lib/api/driver';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops';
import { useDriverShipment } from '@/lib/hooks/api/driver';
import { BottomSheet, Box, Button, FlexLayout, Icon, Text } from '@/ui';

import { CompleteStopButton } from '../stops/CompleteStopButton';
import { DisponentContact } from '../stops/DisponentContact';
import { COMPLETED_CARD_CLASSES, COMPLETED_COLOR, DocumentsIndicator } from '../stops/StopCard';
import { StopDetails } from '../stops/StopDetails';
import { StopDocuments } from '../stops/StopDocuments';
import { formatStopDate, getStopKindLabels, getStopsDisponent, isShipmentCompleted } from '../utils';
import { ShipmentSheetSkeleton, ShipmentSummarySkeleton } from './ShipmentSheetSkeleton';

const RoutePlace: React.FC<{ address: VehicleStopAddress | null }> = ({ address }) => (
  <FlexLayout className="items-center gap-[6px]">
    {address?.countryCode && <CountryFlag code={address.countryCode} size="xxs" />}
    <Text color="text-color-2" variant="text-xs">
      {address?.placeName ?? '-'}
    </Text>
  </FlexLayout>
);

const getShipmentTitle = (shipment: DriverShipmentSummary) => shipment.clientName ?? `Nalog #${shipment.orderNumber}`;

/** Client, order number, route and progress; shared by the card and its bottom sheet header. */
// Same fade as completed stop cards.
const FADED_CLASS = 'opacity-60';

const ShipmentSummary: React.FC<{
  shipment: DriverShipmentSummary;
  /** The card of a completed order: a green title ending in a check, all faded like completed stops. */
  isCompleted?: boolean;
  hasDocuments?: boolean;
}> = ({ shipment, isCompleted, hasDocuments }) => (
  <FlexLayout className={clsx('min-w-0 flex-col gap-1 text-left', isCompleted && FADED_CLASS)}>
    <FlexLayout className="flex-col">
      <FlexLayout className="items-start gap-2">
        <Text color={isCompleted ? COMPLETED_COLOR : 'text-color-1'} variant="text-l-bold">
          {getShipmentTitle(shipment)}
        </Text>
        {isCompleted && (
          <FlexLayout className="h-[40px] shrink-0 items-center">
            <Icon aria-label="Završen nalog" color={COMPLETED_COLOR} icon="IconCircleCheck" size="l" />
          </FlexLayout>
        )}
      </FlexLayout>
      {shipment.clientName && (
        <Text color="text-color-3" variant="text-xs">
          Nalog #{shipment.orderNumber}
        </Text>
      )}
    </FlexLayout>
    <FlexLayout className="flex-wrap items-center gap-[6px]">
      <RoutePlace address={shipment.origin} />
      <Icon color="text-dark-500 dark:text-light-300" icon="IconArrowRight" size="s" />
      <RoutePlace address={shipment.destination} />
    </FlexLayout>
    <FlexLayout className="items-center gap-2">
      <FlexLayout className="gap-1">
        {Array.from({ length: shipment.totalStopsCount }, (_, index) => (
          <Box
            className={clsx(
              'size-2 rounded-circle',
              index < shipment.completedStopsCount ? 'bg-teal-600' : 'border border-dark-300 dark:border-light-600'
            )}
            key={index}
          />
        ))}
      </FlexLayout>
      <Text color="text-color-3" variant="text-xxs">
        {shipment.completedStopsCount}/{shipment.totalStopsCount} postaja
      </Text>
      {hasDocuments && <DocumentsIndicator />}
    </FlexLayout>
  </FlexLayout>
);

const ShipmentTimeline: React.FC<{ shipment: DriverShipment }> = ({ shipment }) => (
  <FlexLayout className="flex-col">
    {shipment.stops.map((stop, index) => {
      const isLast = index === shipment.stops.length - 1;
      return (
        <FlexLayout className="gap-3" key={stop.id}>
          <FlexLayout className="flex-col items-center">
            <Box
              className={clsx(
                'mt-1 size-3 shrink-0 rounded-circle border-2',
                stop.completedAt ? 'border-teal-600 bg-teal-600' : 'border-dark-300 dark:border-light-600'
              )}
            />
            {!isLast && (
              <Box
                className={clsx(
                  'w-[1px] grow',
                  // Segment between two completed stops: the part of the route already driven.
                  stop.completedAt && shipment.stops[index + 1].completedAt
                    ? 'bg-teal-600'
                    : 'bg-dark-200 dark:bg-light-800'
                )}
              />
            )}
          </FlexLayout>
          <FlexLayout className={clsx('min-w-0 grow flex-col gap-3', !isLast && 'pb-6')}>
            <FlexLayout className="items-center gap-2">
              <Text color="text-color-1" variant="text-xs-medium">
                {getStopKindLabels(stop).title}
              </Text>
              <Text color="text-color-3" variant="text-xs">
                {formatStopDate(stop.date, dayjs())}
              </Text>
            </FlexLayout>
            <StopDetails
              actions={
                <>
                  <CompleteStopButton stop={stop} />
                  <StopDocuments isReadOnly stop={stop} />
                </>
              }
              hideShipmentHeaders
              stop={stop}
            />
          </FlexLayout>
        </FlexLayout>
      );
    })}
  </FlexLayout>
);

interface ShipmentCardProps {
  shipment: DriverShipmentSummary;
  onOpen(): void;
}

/** A completed order is history, with the same light green card as completed stops in the route. */
export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onOpen }) => {
  const isCompleted = isShipmentCompleted(shipment);

  return (
    <FlexLayout
      aria-haspopup="dialog"
      as="button"
      className={clsx(
        'w-full rounded-l p-4',
        isCompleted
          ? COMPLETED_CARD_CLASSES
          : 'border border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875'
      )}
      type="button"
      onClick={onOpen}
    >
      <ShipmentSummary isCompleted={isCompleted} shipment={shipment} />
    </FlexLayout>
  );
};

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
        <FlexLayout className="flex-col gap-6">
          <ShipmentTimeline shipment={shipment} />
          <DisponentContact disponent={getStopsDisponent(shipment.stops)} />
        </FlexLayout>
      );
    }

    if (isError) {
      return (
        <FlexLayout className="flex-col items-center gap-2 py-8">
          <Text color="text-color-3" variant="text-s">
            Nalog se nije učitao.
          </Text>
          <Button
            isLoading={isRefetching}
            size="m"
            text="Pokušaj ponovno"
            variant="secondary"
            onClick={() => void refetch()}
          />
        </FlexLayout>
      );
    }

    return <ShipmentSheetSkeleton summary={summary} />;
  }

  function renderHeader() {
    if (header) {
      return (
        <ShipmentSummary hasDocuments={shipment?.stops.some((stop) => stop.documents.length > 0)} shipment={header} />
      );
    }
    // Opened from a notification or link: no list summary to show while the order loads.
    return isError ? null : <ShipmentSummarySkeleton />;
  }

  return (
    <BottomSheet
      header={renderHeader()}
      isOpen={isOpen}
      title={header ? getShipmentTitle(header) : 'Nalog'}
      onOpenChange={onOpenChange}
    >
      {renderContent()}
    </BottomSheet>
  );
};
