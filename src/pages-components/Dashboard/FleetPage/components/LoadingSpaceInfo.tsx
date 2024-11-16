import type { Vehicle } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { loadTypeOptions } from '@/pages-components/Dashboard/FleetPage/NewVehicleForm/const';
import { Box, Divider, FlexLayout, Icon, Text } from '@/ui';

import { InfoItem } from '@/components/InfoItem';

interface LoadingSpaceInfoProps {
  vehicle: Vehicle;
}

export const LoadingSpaceInfo: React.FC<LoadingSpaceInfoProps> = ({ vehicle }) => {
  const { id, type, loadCapacity, dimensions, equipment, vehicleLoadType, codeXlCertificateExpiryDate, ramp } = vehicle;

  const { data } = useAlertByVehicleType(type);
  const vehicleAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = vehicleAlerts?.map((va) => ruleToPropertyMap[va.ruleName]);

  const loadType = loadTypeOptions.find((l) => l.value === vehicleLoadType)?.label;

  const formattedXlExpiryDate = codeXlCertificateExpiryDate
    ? new Date(codeXlCertificateExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

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
      <InfoItem
        label="Code XL - Expiry date"
        value={formattedXlExpiryDate}
        isAlert={propertiesWithAlert?.includes('codeXlCertificateExpiryDate')}
      />
      <Divider />
      <FlexLayout className="justify-between items-center">
        <Text color="text-color-3" variant="text-s-medium">
          Ramp
        </Text>
        {ramp ? (
          <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
        ) : (
          <Icon className="text-red-500" icon="XCircleIcon" size="l" />
        )}
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Load Type" value={loadType ?? '-'} />
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
