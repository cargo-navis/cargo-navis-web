import {
  Timeline,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
} from '@/components/reui/timeline';
import { Box, FlexLayout, Text, TextButton } from '@/ui';

const PLACEHOLDER_BAR = 'rounded-s bg-dark-200/40 dark:bg-light-800/40';

interface EmptyShipmentVehicleStopsProps {
  onAssignClick(): void;
}

export const EmptyShipmentVehicleStops = ({ onAssignClick }: EmptyShipmentVehicleStopsProps) => (
  <FlexLayout className="flex-col gap-3">
    <FlexLayout className="flex-col gap-1">
      <FlexLayout className="items-center justify-between gap-2">
        <Text color="text-color-4" variant="text-s-medium">
          Tijek prijevoza
        </Text>
        <TextButton
          iconRight="IconArrowRight"
          size="s"
          text="Dodijeli vozilo"
          type="button"
          variant="secondary"
          onClick={onAssignClick}
        />
      </FlexLayout>
      <Text color="text-color-4" variant="text-xxs">
        Nalog još nije dodijeljen vozilu
      </Text>
    </FlexLayout>
    <Box className="opacity-70">
      <Timeline className="w-full pt-5" defaultValue={0} orientation="vertical">
        {[0, 1, 2].map((i) => (
          <PlaceholderEntry key={i} step={i + 1} />
        ))}
      </Timeline>
    </Box>
  </FlexLayout>
);

const PlaceholderEntry = ({ step }: { step: number }) => (
  <TimelineItem step={step} style={{ paddingLeft: '24px', paddingBottom: '24px' }}>
    <TimelineHeader>
      <TimelineSeparator
        style={{
          left: '5px',
          top: '20px',
          height: 'calc(100% - 12px)',
          width: '2px',
        }}
      />
      <TimelineIndicator
        className="border-dark-300 dark:border-light-700 bg-dark-200/40 dark:bg-light-800/40"
        style={{ top: 6, left: 0, width: 12, height: 12 }}
      />
    </TimelineHeader>
    <FlexLayout className="flex-col gap-3 relative -top-[11px]">
      <FlexLayout className="flex-col gap-1">
        <Box className={`${PLACEHOLDER_BAR} h-[12px] w-[70px]`} />
        <Box className={`${PLACEHOLDER_BAR} h-[14px] w-[110px]`} />
      </FlexLayout>
      <Box className={`${PLACEHOLDER_BAR} h-[12px] w-[140px]`} />
    </FlexLayout>
  </TimelineItem>
);
