import { VehicleAnalyticsItem } from '@/lib/api';
import { useVehicle } from '@/lib/hooks/api';
import { formatEur } from '@/lib/utils/analytics';
import { FlexLayout, Text } from '@/ui';

import { TOP_N } from '../utils';
import { AnalyticsCard, EmptyTableState, TableHeader, TableRow } from './AnalyticsCard';
import { ParticipationHeader } from './ParticipationHeader';

interface VehicleRowProps {
  vehicle: VehicleAnalyticsItem;
  index: number;
}

const VehicleRow = ({ index, vehicle }: VehicleRowProps) => {
  const { data: vehicleData } = useVehicle(vehicle.vehicleId);
  const displayName = vehicleData?.registration || vehicle.vehicleId;

  return (
    <TableRow index={index}>
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {vehicle.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {formatEur(vehicle.totalPrice)}
      </Text>
    </TableRow>
  );
};

interface VehiclesTableProps {
  data: VehicleAnalyticsItem[];
}

export const VehiclesTable = ({ data }: VehiclesTableProps) => (
  <AnalyticsCard title={`Top ${TOP_N} vozila`}>
    <TableHeader>
      <Text className="flex-1" color="text-color-2" variant="text-s-medium">
        Vozilo
      </Text>
      <ParticipationHeader
        basis="basis-[140px]"
        label="Br. naloga"
        tooltip="Broj naloga u kojima je vozilo sudjelovalo."
      />
      <ParticipationHeader
        basis="basis-[200px]"
        label="Ukupni prihod"
        tooltip="Ukupni prihod naloga u kojima je vozilo sudjelovalo."
      />
    </TableHeader>

    <FlexLayout className="flex-col">
      {data.length === 0 ? (
        <EmptyTableState text="Nema podataka za odabrano razdoblje." />
      ) : (
        data.map((vehicle, index) => <VehicleRow index={index} key={vehicle.vehicleId} vehicle={vehicle} />)
      )}
    </FlexLayout>
  </AnalyticsCard>
);
