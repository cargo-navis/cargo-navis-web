import type { Vehicle } from '@/lib/api';
import { Divider, FlexLayout, Text } from '@/ui';

import { InfoItem } from '@/components/InfoItem';

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle }) => {
  const {
    enginePower,
    averageFuelConsumption,
    tankSize,
    emissionStandard,
    adrExpiryDate,
    fireExtinguisherCheckExpiryDate,
  } = vehicle;

  const formattedAdrExpiryDate = adrExpiryDate
    ? new Date(adrExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedFireExtinguisherCheckExpiryDate = fireExtinguisherCheckExpiryDate
    ? new Date(fireExtinguisherCheckExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

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
        <Divider />
        <InfoItem label="ADR - Expiry Date" value={formattedAdrExpiryDate} />
        <InfoItem label="Fire Extinguisher - Expiry Date" value={formattedFireExtinguisherCheckExpiryDate} />
      </FlexLayout>
    </FlexLayout>
  );
};
