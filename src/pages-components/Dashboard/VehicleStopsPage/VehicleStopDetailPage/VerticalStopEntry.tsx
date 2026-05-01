import clsx from 'clsx';
import dayjs from 'dayjs';

import { EmployeeName } from '@/components/employees/EmployeeName';
import {
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { CargoSection } from './CargoSection';

interface VerticalStopEntryProps {
  stop: VehicleStop;
  step: number;
  completed?: boolean;
  separatorActive?: boolean;
  onEdit?(stop: VehicleStop): void;
  onDelete?(stop: VehicleStop): void;
  onInsertBefore?(): void;
}

export const VerticalStopEntry = ({
  stop,
  step,
  completed,
  separatorActive,
  onEdit,
  onDelete,
  onInsertBefore,
}: VerticalStopEntryProps) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;

  return (
    <TimelineItem
      className="group/stop-entry relative"
      completed={completed}
      separatorActive={separatorActive}
      step={step}
      style={{ paddingLeft: '32px', paddingBottom: '48px' }}
    >
      <TimelineHeader>
        <TimelineSeparator
          style={{
            left: '7px',
            top: '16px',
            height: 'calc(100% - 16px)',
            width: '2px',
          }}
        />
        <TimelineIndicator style={{ top: 0, left: 0 }} />
      </TimelineHeader>
      <TimelineDate>
        {date ? (
          dayjs(date).format('DD.MM.YYYY')
        ) : (
          <Box as="span" className="text-red-600 italic">
            Datum nedostaje
          </Box>
        )}
      </TimelineDate>
      <FlexLayout className="items-center gap-1">
        <FlexLayout
          className={clsx(
            'items-center gap-1 text-dark-600 dark:text-light-300',
            !stop.driverId && 'text-red-600 dark:text-red-600'
          )}
        >
          <Icon icon="TruckIcon" size="s" />
          {stop.driverId ? (
            <EmployeeName id={stop.driverId} variant="text-xs" />
          ) : (
            <Text as="span" variant="text-xs">
              Vozač nedostaje
            </Text>
          )}
        </FlexLayout>
        <Text color="text-color-3" variant="text-xs">
          •
        </Text>
        <FlexLayout
          className={clsx(
            'items-center gap-1 text-dark-600 dark:text-light-300',
            !stop.disponentId && 'text-red-600 dark:text-red-600'
          )}
        >
          <Icon icon="UserIcon" size="s" />
          {stop.disponentId ? (
            <EmployeeName id={stop.disponentId} variant="text-xs" />
          ) : (
            <Text as="span" variant="text-xs">
              Disponent nedostaje
            </Text>
          )}
        </FlexLayout>
      </FlexLayout>
      <TimelineTitle>
        <Text as="span" color="text-color-1" variant="text-l-medium">
          {address?.placeName ?? '-'}
        </Text>
      </TimelineTitle>
      <TimelineContent>
        <Text color="text-color-3" variant="text-xxs">
          {address ? `${address.streetName}, ${address.postalCode}` : '-'}
        </Text>
      </TimelineContent>
      {(hasLoading || hasUnloading) && (
        <FlexLayout className="gap-3 mt-2">
          {hasLoading && (
            <CargoSection
              addressType="loading"
              cargos={loadingCargos}
              className="text-orange-500"
              icon="ArrowRightEndOnRectangleIcon"
              label="Utovar"
            />
          )}
          {hasUnloading && (
            <CargoSection
              addressType="unloading"
              cargos={unloadingCargos}
              className="text-teal-500"
              icon="ArrowRightStartOnRectangleIcon"
              label="Istovar"
            />
          )}
          {(!hasLoading || !hasUnloading) && <Box className="flex-1" />}
        </FlexLayout>
      )}
      {onInsertBefore && (
        <FlexLayout className="flex-col absolute hidden group-hover/stop-entry:flex justify-center -left-2 top-2 bottom-0">
          <FlexLayout
            as="button"
            className="items-center justify-center w-[32px] h-[32px] rounded-circle bg-white dark:bg-black border-2 border-dashed border-teal-500 hover:border-teal-700 text-teal-500 hover:text-teal-700"
            type="button"
            onClick={onInsertBefore}
          >
            <Icon className="text-inherit" icon="PlusIcon" size="m" />
          </FlexLayout>
        </FlexLayout>
      )}
      {(onEdit || onDelete) && (
        <Box className="absolute top-0 right-0 hidden group-hover/stop-entry:block">
          <FlexLayout className="items-center gap-2">
            {onEdit && (
              <Icon
                className="cursor-pointer text-dark-600 hover:text-teal-500 dark:text-light-300"
                icon="PencilSquareIcon"
                size="l"
                onClick={() => onEdit(stop)}
              />
            )}
            {onDelete && (
              <Icon
                className="cursor-pointer text-dark-600 hover:text-red-500 dark:text-light-300"
                icon="TrashIcon"
                size="l"
                onClick={() => onDelete(stop)}
              />
            )}
          </FlexLayout>
        </Box>
      )}
    </TimelineItem>
  );
};
