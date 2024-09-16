import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';
import { useRouter } from 'next/router';
import { GeneralInfo } from './GeneralInfo';
import { VehicleInfo } from './VehicleInfo';

export const SingleTruckPage = () => {
  const { query } = useRouter();
  const truckId = query.id;

  const { data: truck } = useVehicle(truckId as string);

  return (
    <DashboardLayout>
      <Box>{!truck ? <LoadingSpinner /> : <MainContent truck={truck} />}</Box>
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ truck: Vehicle }> = ({ truck }) => {
  const { registration, brand, manufacturingYear } = truck;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/trucks" />
      <FlexLayout className="items-center gap-6">
        <Box className="py-3 pl-3">
          <FlexLayout className="items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
            <Icon color="text-white" icon="TruckIcon" size="xl" />
          </FlexLayout>
        </Box>
        <FlexLayout className="flex-col">
          <Text color="text-color-1" variant="text-xxl-bold">
            {registration}
          </Text>
          <Text color="text-color-3" variant="text-m-medium">
            {brand} ({manufacturingYear})
          </Text>
        </FlexLayout>
      </FlexLayout>
      <FlexLayout className="ml-4 gap-10">
        <GeneralInfo truck={truck} />
        <VehicleInfo truck={truck} />
      </FlexLayout>
    </FlexLayout>
  );
};
