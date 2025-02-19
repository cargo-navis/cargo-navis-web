import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Icon, Pill, Text } from '@/ui';

import { GeneralInfo } from '../../components/GeneralInfo';
import { LoadingSpaceInfo } from '../../components/LoadingSpaceInfo';
import { VehicleActions } from '../../components/VehicleActions';

export const SingleTrailerPage = () => {
  const { query } = useRouter();
  const trailerId = query.id;

  const { data: trailer } = useVehicle(trailerId as string);

  return <DashboardLayout>{!trailer ? <LoadingPage /> : <MainContent trailer={trailer} />}</DashboardLayout>;
};

const MainContent: React.FC<{ trailer: Vehicle }> = ({ trailer }) => {
  const { registration, brand, manufacturingYear, id, type } = trailer;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/trailers" />
      <FlexLayout className="justify-between">
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
            <FlexLayout className="gap-3 items-center">
              <Text color="text-color-3" variant="text-m-medium">
                {brand} ({manufacturingYear})
              </Text>
              <Pill text="Poluprikolica" variant="warning" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <VehicleActions id={id} type={type} />
      </FlexLayout>
      <FlexLayout className="ml-4 gap-10">
        <GeneralInfo vehicle={trailer} />
        <LoadingSpaceInfo vehicle={trailer} />
      </FlexLayout>
    </FlexLayout>
  );
};
