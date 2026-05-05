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
import { Box, FlexLayout, Icon2, Text } from '@/ui';
import { Tooltip } from '@/ui/components/Tooltip/Tooltip';

interface StopTimelineItemProps {
  stop: VehicleStop;
  step: number;
}

const StopTooltipContent = ({ stop }: { stop: VehicleStop }) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;

  return (
    <FlexLayout className="p-2 flex-col text-light-50">
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
        <Text as="span" className="text-orange-400" variant="text-xs">
          {[
            loadingCargos.length > 0 && `${loadingCargos.length} utovar`,
            unloadingCargos.length > 0 && `${unloadingCargos.length} istovar`,
          ]
            .filter(Boolean)
            .join(', ')}
        </Text>
      )}
    </FlexLayout>
  );
};

export const StopTimelineEntry = ({ stop, step }: StopTimelineItemProps) => {
  const { address, date, loadingCargos, unloadingCargos } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;

  return (
    <TimelineItem step={step} style={{ paddingRight: '32px' }}>
      <TimelineHeader>
        <TimelineSeparator
          style={{
            top: '28px',
            height: '2px',
            width: 'calc(100% - 20px)',
            transform: 'translateX(18px) translateY(-50%)',
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
            {hasLoading && <Icon2 className="text-orange-500 dark:text-orange-400" icon="IconPackageImport" size="s" />}
            {hasUnloading && <Icon2 className="text-teal-500 dark:text-teal-400" icon="IconPackageExport" size="s" />}
          </Text>
        </TimelineTitle>
        <Tooltip content={<StopTooltipContent stop={stop} />} isPortal>
          <TimelineIndicator
            className="z-10 cursor-default"
            style={{ top: '28px', left: 0, transform: 'translateY(-50%)' }}
            onClick={(e) => e.preventDefault()}
          />
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
