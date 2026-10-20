import clsx from 'clsx';
import dayjs from 'dayjs';
import { useState } from 'react';

import { CountryFlag } from '@/components/countries';
import type { DriverShipment } from '@/lib/api/driver';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops';
import { BottomSheet, Box, FlexLayout, Icon, Text } from '@/ui';

import { CompleteStopButton } from './CompleteStopButton';
import { StopDetails } from './StopDetails';
import { StopDocuments } from './StopDocuments';
import { formatStopDate, getStopKindLabels } from './utils';

const RoutePlace: React.FC<{ address: VehicleStopAddress | null }> = ({ address }) => (
  <FlexLayout className="items-center gap-[6px]">
    {address?.countryCode && <CountryFlag code={address.countryCode} size="xxs" />}
    <Text color="text-color-2" variant="text-xs">
      {address?.placeName ?? '-'}
    </Text>
  </FlexLayout>
);

/** Order number, route and progress; shared by the card and its bottom sheet header. */
const ShipmentSummary: React.FC<{ shipment: DriverShipment }> = ({ shipment }) => (
  <FlexLayout className="min-w-0 flex-col gap-1 text-left">
    <Text color="text-color-1" variant="text-s-medium">
      Nalog #{shipment.orderNumber}
    </Text>
    <FlexLayout className="flex-wrap items-center gap-[6px]">
      <RoutePlace address={shipment.origin} />
      <Icon color="text-dark-500 dark:text-light-300" icon="IconArrowRight" size="s" />
      <RoutePlace address={shipment.destination} />
    </FlexLayout>
    <FlexLayout className="items-center gap-2">
      <FlexLayout className="gap-1">
        {shipment.stops.map((stop) => (
          <Box
            className={clsx(
              'size-2 rounded-circle',
              stop.completedAt ? 'bg-teal-600' : 'border border-dark-300 dark:border-light-600'
            )}
            key={stop.id}
          />
        ))}
      </FlexLayout>
      <Text color="text-color-3" variant="text-xxs">
        {shipment.completedStopsCount}/{shipment.totalStopsCount} postaja
      </Text>
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
                  <StopDocuments stop={stop} />
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

export const ShipmentCard: React.FC<{ shipment: DriverShipment }> = ({ shipment }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FlexLayout
        aria-haspopup="dialog"
        as="button"
        className="w-full items-center justify-between gap-2 rounded-l border border-dark-100 bg-white p-4 shadow-sm dark:border-light-850 dark:bg-light-875"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <ShipmentSummary shipment={shipment} />
        <Icon className="shrink-0" color="text-dark-500 dark:text-light-300" icon="IconChevronRight" size="m" />
      </FlexLayout>
      <BottomSheet
        header={<ShipmentSummary shipment={shipment} />}
        isOpen={isOpen}
        title={`Nalog #${shipment.orderNumber}`}
        onOpenChange={setIsOpen}
      >
        <ShipmentTimeline shipment={shipment} />
      </BottomSheet>
    </>
  );
};
