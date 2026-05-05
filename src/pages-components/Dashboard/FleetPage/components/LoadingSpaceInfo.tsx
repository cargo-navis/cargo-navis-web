import { InfoItem } from '@/components/InfoItem';
import type { Vehicle } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { equipmentNameMap, loadTypeOptions } from '@/pages-components/Dashboard/FleetPage/NewVehicleForm/const';
import { Box, Divider, FlexLayout, Icon2, Text } from '@/ui';

function roundIfDecimal(n: number) {
  return Number.isInteger(n) ? n : Number(n.toFixed(2));
}

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

  const length = dimensions?.length ? roundIfDecimal(dimensions.length) : '—';
  const width = dimensions?.width ? roundIfDecimal(dimensions.width) : '—';
  const height = dimensions?.height ? roundIfDecimal(dimensions.height) : '—';

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text color="text-color-2" variant="text-l-medium">
        Podaci o utovarnom prostoru
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Kapacitet (kg)" value={loadCapacity} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <Text color="text-color-3" variant="text-m-medium">
          Dimenzije (m)
        </Text>
        <InfoItem label="Duljina" value={length} />
        <InfoItem label="Širina" value={width} />
        <InfoItem label="Visina" value={height} />
      </FlexLayout>
      <Divider />
      <InfoItem
        isAlert={propertiesWithAlert?.includes('codeXlCertificateExpiryDate')}
        label="Kod XL - Vrijedi do"
        value={formattedXlExpiryDate}
      />
      <Divider />
      <FlexLayout className="justify-between items-center">
        <Text color="text-color-3" variant="text-s-medium">
          Rampa
        </Text>
        {ramp ? (
          <Icon2 className="text-green-600" icon="IconCircleCheck" size="l" />
        ) : (
          <Icon2 className="text-red-500" icon="IconCircleX" size="l" />
        )}
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Vrsta utovarnog prostora" value={loadType ?? '—'} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="justify-between items-baseline">
        <Text color="text-color-3" variant="text-m-medium">
          Oprema:
        </Text>
        <Box as="ul" className="text-end gap-1">
          {equipment.map((item) => (
            <Text as="li" className="capitalize" color="text-color-1" key={item} variant="text-s-medium">
              {equipmentNameMap[item]}
            </Text>
          ))}
        </Box>
      </FlexLayout>
    </FlexLayout>
  );
};
