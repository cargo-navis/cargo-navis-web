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
import type { VehicleStop, VehicleStopCargo } from '@/lib/api/vehicleStops';
import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

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
      <TimelineDate>{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</TimelineDate>
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
        <FlexLayout className="items-center gap-3 mt-1">
          {hasLoading && (
            <Tooltip content={<CargoTooltipList cargos={loadingCargos} />}>
              <FlexLayout className="items-center gap-1 text-orange-500">
                <Icon icon="ArrowRightEndOnRectangleIcon" size="m" />
                <Text variant="text-xs">Utovar ({loadingCargos.length})</Text>
              </FlexLayout>
            </Tooltip>
          )}
          {hasUnloading && (
            <Tooltip content={<CargoTooltipList cargos={unloadingCargos} />}>
              <FlexLayout className="items-center gap-1 text-teal-500">
                <Icon icon="ArrowRightStartOnRectangleIcon" size="m" />
                <Text variant="text-xs">Istovar ({unloadingCargos.length})</Text>
              </FlexLayout>
            </Tooltip>
          )}
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

const CargoTooltipList = ({ cargos }: { cargos: VehicleStopCargo[] }) => (
  <FlexLayout as="ul" className="flex-col gap-2 px-2 py-1">
    {cargos.map((cargo) => (
      <FlexLayout as="li" className="flex-col list-disc list-inside" key={cargo.id}>
        {/*<ClientName color="text-color-3" id={cargo.clientId} variant="text-xxs" />*/}
        <Text color="text-white" variant="text-xxs-medium">
          {cargo.description || '-'}
        </Text>
      </FlexLayout>
    ))}
  </FlexLayout>
);
