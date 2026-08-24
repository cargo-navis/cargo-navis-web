import { DriverAnalyticsItem } from '@/lib/api';
import { useEmployee } from '@/lib/hooks/api';
import { formatEur } from '@/lib/utils/analytics';
import { FlexLayout, Text } from '@/ui';

import { TOP_N } from '../utils';
import { AnalyticsCard, EmptyTableState, TableHeader, TableRow } from './AnalyticsCard';
import { ParticipationHeader } from './ParticipationHeader';

interface DriverRowProps {
  driver: DriverAnalyticsItem;
  index: number;
}

const DriverRow = ({ driver, index }: DriverRowProps) => {
  const { data: employee } = useEmployee(driver.driverId);
  const displayName = employee?.fullName || `${employee?.firstName} ${employee?.lastName}` || driver.driverId;

  return (
    <TableRow index={index}>
      <Text className="flex-1" color="text-color-1" variant="text-s-medium">
        {displayName}
      </Text>
      <Text className="basis-[140px] text-right" color="text-color-1" variant="text-s">
        {driver.shipmentCount}
      </Text>
      <Text className="basis-[200px] text-right" color="text-color-1" variant="text-s">
        {formatEur(driver.totalPrice)}
      </Text>
    </TableRow>
  );
};

interface DriversTableProps {
  data: DriverAnalyticsItem[];
}

export const DriversTable = ({ data }: DriversTableProps) => (
  <AnalyticsCard title={`Top ${TOP_N} vozača`}>
    <TableHeader>
      <Text className="flex-1" color="text-color-2" variant="text-s-medium">
        Vozač
      </Text>
      <ParticipationHeader
        basis="basis-[140px]"
        label="Br. naloga"
        tooltip="Broj naloga u kojima je vozač sudjelovao."
      />
      <ParticipationHeader
        basis="basis-[200px]"
        label="Ukupni prihod"
        tooltip="Ukupni prihod naloga u kojima je vozač sudjelovao."
      />
    </TableHeader>

    <FlexLayout className="flex-col">
      {data.length === 0 ? (
        <EmptyTableState text="Nema podataka za odabrano razdoblje." />
      ) : (
        data.map((driver, index) => <DriverRow driver={driver} index={index} key={driver.driverId} />)
      )}
    </FlexLayout>
  </AnalyticsCard>
);
