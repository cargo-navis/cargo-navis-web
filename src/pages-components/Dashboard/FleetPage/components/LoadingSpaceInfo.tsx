import type { Vehicle } from '@/lib/api';
import { Box, Divider, FlexLayout, Text } from '@/ui';

import { InfoItem } from './InfoItem';

interface LoadingSpaceInfoProps {
  vehicle: Vehicle;
}

export const LoadingSpaceInfo: React.FC<LoadingSpaceInfoProps> = ({ vehicle }) => {
  const { loadCapacity, dimensions, equipment } = vehicle;

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        Loading Space Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Load Capacity (kg)" value={loadCapacity} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <Text variant="text-m-medium" color="text-color-3">
          Dimensions (m)
        </Text>
        <InfoItem label="Length" value={dimensions.length.toFixed(2)} />
        <InfoItem label="Width" value={dimensions.width.toFixed(2)} />
        <InfoItem label="Height" value={dimensions.height.toFixed(2)} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="justify-between items-baseline">
        <Text variant="text-m-medium" color="text-color-3">
          Equipment:
        </Text>
        <Box as="ul" className="text-end gap-1">
          {equipment.map((item) => {
            const name = item.split('_').join(' ');
            return (
              <Text color="text-color-1" variant="text-s-medium" as="li" className="capitalize" key={item}>
                {name}
              </Text>
            );
          })}
        </Box>
      </FlexLayout>
    </FlexLayout>
  );
};
