import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';
import { useRouter } from 'next/router';

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
    <Box className="py-5 flex flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/trucks" />
      <Box className="flex justify-between">
        <Box className="flex items-center gap-6">
          <Box className="py-3 pl-3">
            <Box className="flex items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
              <Icon color="text-white" icon="TruckIcon" size="xl" />
            </Box>
          </Box>
          <FlexLayout className="flex-col">
            <Text color="text-color-1" variant="text-xxl-bold">
              {registration}
            </Text>
            <Text color="text-color-3" variant="text-m-medium">
              {brand} ({manufacturingYear})
            </Text>
          </FlexLayout>
        </Box>
      </Box>
    </Box>
  );
};
