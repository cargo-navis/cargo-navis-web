import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { VehicleInfo } from '@/pages-components/Dashboard/FleetPage/components/VehicleInfo';
import { Box, DisplayIf, FlexLayout, Icon, Pill, Text } from '@/ui';

import { GeneralInfo } from '../../components/GeneralInfo';
import { LoadingSpaceInfo } from '../../components/LoadingSpaceInfo';
import { VehicleActions } from '../../components/VehicleActions';

export const SingleSoloTruckPage = () => {
  const { query } = useRouter();
  const soloId = query.id;

  const { data: solo } = useVehicle(soloId as string);

  return <DashboardLayout>{!solo ? <LoadingPage /> : <MainContent solo={solo} />}</DashboardLayout>;
};

const MainContent: React.FC<{ solo: Vehicle }> = ({ solo }) => {
  const { registration, brand, manufacturingYear, id, type } = solo;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/solo-trucks" />
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
              <DisplayIf condition={!!brand}>
                <Text color="text-color-3" variant="text-m-medium">
                  {brand} {manufacturingYear && `(${manufacturingYear})`}
                </Text>
              </DisplayIf>
              <Pill text="Solo Kamion" variant="danger" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <VehicleActions id={id} name={registration} type={type} />
      </FlexLayout>
      <FlexLayout className="ml-4 gap-10 flex-wrap">
        <GeneralInfo vehicle={solo} />
        <VehicleInfo vehicle={solo} />
        <LoadingSpaceInfo vehicle={solo} />
      </FlexLayout>
    </FlexLayout>
  );
};
