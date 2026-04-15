import dayjs from 'dayjs';

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
import { FlexLayout, Icon, Text } from '@/ui';

interface VerticalStopEntryProps {
  stop: VehicleStop;
  step: number;
  completed?: boolean;
  separatorActive?: boolean;
}

export const VerticalStopEntry = ({ stop, step, completed, separatorActive }: VerticalStopEntryProps) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;

  return (
    <TimelineItem
      completed={completed}
      separatorActive={separatorActive}
      step={step}
      style={{ paddingLeft: '32px', paddingBottom: '24px' }}
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
        {date ? dayjs(date).format('DD.MM.YYYY') : <span className="italic">Nije posjećeno</span>}
      </TimelineDate>
      <TimelineTitle>
        <Text as="span" color="text-color-1" variant="text-l-medium">
          {address.city}
        </Text>
      </TimelineTitle>
      <TimelineContent>
        <Text color="text-color-3" variant="text-xxs">
          {address.streetName}, {address.postalCode}
        </Text>
      </TimelineContent>
      {(hasLoading || hasUnloading) && (
        <FlexLayout className="items-center gap-2 mt-1">
          {hasLoading && (
            <FlexLayout className="items-center gap-1 text-orange-500">
              <Icon icon="ArrowRightEndOnRectangleIcon" size="m" />
              <Text variant="text-xs">{loadingCargos.length} utovar</Text>
            </FlexLayout>
          )}
          {hasUnloading && (
            <FlexLayout className="items-center gap-1 text-teal-500">
              <Icon icon="ArrowRightStartOnRectangleIcon" size="m" />
              <Text variant="text-xs">{unloadingCargos.length} istovar</Text>
            </FlexLayout>
          )}
        </FlexLayout>
      )}
    </TimelineItem>
  );
};
