import type { Vehicle } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { equipmentNameMap, loadTypeOptions } from '@/pages-components/Dashboard/FleetPage/NewVehicleForm/const';
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

  const formattedXlExpiryDate = getDataPointDateString(codeXlCertificateExpiryDate);

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        Podaci o utovarnom prostoru
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Kapacitet (kg)" value={loadCapacity} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <Text variant="text-m-medium" color="text-color-3">
          Dimenzije (m)
        </Text>
        <InfoItem label="Duljina" value={dimensions?.length.toFixed(2) || '-'} />
        <InfoItem label="Širina" value={dimensions?.width.toFixed(2) || '-'} />
        <InfoItem label="Visina" value={dimensions?.height.toFixed(2) || '-'} />
      </FlexLayout>
      <Divider />
      <InfoItem
        label="Kod XL - Vrijedi do"
        value={formattedXlExpiryDate}
        isAlert={propertiesWithAlert?.includes('codeXlCertificateExpiryDate')}
      />
      <Divider />
      <FlexLayout className="justify-between items-center">
        <Text color="text-color-3" variant="text-s-medium">
          Rampa
        </Text>
        {ramp ? (
          <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
        ) : (
          <Icon className="text-red-500" icon="XCircleIcon" size="l" />
        )}
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Vrsta utovarnog prostora" value={loadType ?? '-'} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="justify-between items-baseline">
        <Text variant="text-m-medium" color="text-color-3">
          Oprema:
        </Text>
        <Box as="ul" className="text-end gap-1">
          {equipment.map((item) => (
            <Text color="text-color-1" variant="text-s-medium" as="li" className="capitalize" key={item}>
              {equipmentNameMap[item]}
            </Text>
          ))}
        </Box>
      </FlexLayout>
    </FlexLayout>
  );
};
