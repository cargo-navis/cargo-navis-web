import type { Vehicle } from '@/lib/api';
import { Divider, FlexLayout, Text } from '@/ui';

import { InfoItem } from './InfoItem';

interface VehicleInfoProps {
  truck: Vehicle;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ truck }) => {
  const { enginePower, averageFuelConsumption, tankSize, emissionStandard } = truck;

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        Vehicle Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Engine Power (kW)" value={enginePower} />
        <InfoItem label="Engine Type" value={emissionStandard} />
        <Divider />
      </FlexLayout>
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Tank Size (l)" value={tankSize} />
        <InfoItem label="Fuel Consumption (l/100km)" value={averageFuelConsumption} />
      </FlexLayout>
    </FlexLayout>
  );
};
