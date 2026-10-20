import clsx from 'clsx';
import dayjs from 'dayjs';

import { CountryFlag } from '@/components/countries';
import type { DriverShipment } from '@/lib/api/driver';
import type { VehicleStopAddress } from '@/lib/api/vehicleStops';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { CompleteStopButton } from './CompleteStopButton';
import { StopDetails } from './StopDetails';
import { StopDocuments } from './StopDocuments';
import { formatStopDate, getStopKindLabels } from './utils';

interface ShipmentCardProps {
  shipment: DriverShipment;
  isExpanded: boolean;
  onToggle(): void;
}

const RoutePlace: React.FC<{ address: VehicleStopAddress | null }> = ({ address }) => (
  <FlexLayout className="items-center gap-[6px]">
    {address?.countryCode && <CountryFlag code={address.countryCode} size="xxs" />}
    <Text color="text-color-2" variant="text-xs">
      {address?.placeName ?? '-'}
    </Text>
  </FlexLayout>
);

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, isExpanded, onToggle }) => {
  return (
    <Box className="rounded-l border border-dark-100 bg-white shadow-sm dark:border-light-850 dark:bg-light-875">
      <FlexLayout
        aria-expanded={isExpanded}
        as="button"
        className="w-full flex-col gap-1 p-4 text-left"
        type="button"
        onClick={onToggle}
      >
        <FlexLayout className="w-full items-center justify-between gap-2">
          <Text color="text-color-1" variant="text-s-medium">
            Nalog #{shipment.orderNumber}
          </Text>
          <Icon
            color="text-dark-500 dark:text-light-300"
            icon={isExpanded ? 'IconChevronUp' : 'IconChevronDown'}
            size="m"
          />
        </FlexLayout>
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
      {isExpanded && (
        <FlexLayout className="flex-col border-t border-dark-100 p-4 dark:border-light-850">
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
      )}
    </Box>
  );
};
