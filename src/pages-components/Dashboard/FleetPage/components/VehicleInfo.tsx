import { InfoItem } from '@/components/InfoItem';
import type { Vehicle } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { Divider, FlexLayout, Text } from '@/ui';

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle }) => {
  const {
    id,
    type,
    enginePower,
    averageFuelConsumption,
    tankSize,
    emissionStandard,
    adrExpiryDate,
    fireExtinguisherCheckExpiryDate,
  } = vehicle;

  const { data } = useAlertByVehicleType(type);
  const vehicleAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = vehicleAlerts?.map((va) => ruleToPropertyMap[va.ruleName]);

  const formattedAdrExpiryDate = getDataPointDateString(adrExpiryDate);
  const formattedFireExtinguisherCheckExpiryDate = getDataPointDateString(fireExtinguisherCheckExpiryDate);

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text color="text-color-2" variant="text-l-medium">
        Podaci o vozilu
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Snaga motora (kW)" value={enginePower} />
        <InfoItem label="Tip motora" value={emissionStandard} />
        <Divider />
      </FlexLayout>
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Veličina tanka (l)" value={tankSize} />
        <InfoItem label="Potrošnja (l/100km)" value={averageFuelConsumption} />
        <Divider />
        <InfoItem
          isAlert={propertiesWithAlert?.includes('adrExpiryDate')}
          label="ADR - Vrijedi do"
          value={formattedAdrExpiryDate}
        />
        <InfoItem
          isAlert={propertiesWithAlert?.includes('fireExtinguisherCheckExpiryDate')}
          label="Vatrogasni aparat - Vrijedi do"
          value={formattedFireExtinguisherCheckExpiryDate}
        />
      </FlexLayout>
    </FlexLayout>
  );
};
