import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { VehicleActions } from '@/pages-components/Dashboard/FleetPage/components/VehicleActions';
import { VehicleInfo } from '@/pages-components/Dashboard/FleetPage/components/VehicleInfo';
import { Box, FlexLayout, Icon, Pill, Text } from '@/ui';

import { GeneralInfo } from '../../components/GeneralInfo';
import { LoadingSpaceInfo } from '../../components/LoadingSpaceInfo';

export const SingleVanPage = () => {
  const { query } = useRouter();
  const vanId = query.id;

  const { data: van } = useVehicle(vanId as string);

  return <DashboardLayout>{!van ? <LoadingPage /> : <MainContent van={van} />}</DashboardLayout>;
};

const MainContent: React.FC<{ van: Vehicle }> = ({ van }) => {
  const { registration, brand, manufacturingYear, id, type } = van;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/vans" />
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
              <Pill text="Kombi" variant="info" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <VehicleActions id={id} type={type} />
      </FlexLayout>
      <FlexLayout className="ml-4 gap-10 flex-wrap">
        <GeneralInfo vehicle={van} />
        <VehicleInfo vehicle={van} />
        <LoadingSpaceInfo vehicle={van} />
      </FlexLayout>
    </FlexLayout>
  );
};
