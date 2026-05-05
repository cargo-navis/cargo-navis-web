import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { VehicleActions } from '@/pages-components/Dashboard/FleetPage/components/VehicleActions';
import { Box, DisplayIf, FlexLayout, Icon, Pill, Text } from '@/ui';

import { DocumentsSection } from '../../components/DocumentsSection';
import { GeneralInfo } from '../../components/GeneralInfo';
import { VehicleInfo } from '../../components/VehicleInfo';

export const SingleTruckPage = () => {
  const { query } = useRouter();
  const truckId = query.id;

  const { data: truck } = useVehicle(truckId as string);

  return <DashboardLayout>{!truck ? <LoadingPage /> : <MainContent truck={truck} />}</DashboardLayout>;
};

const MainContent: React.FC<{ truck: Vehicle }> = ({ truck }) => {
  const { registration, brand, manufacturingYear, id, type } = truck;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/fleet/trucks" />
      <FlexLayout className="justify-between">
        <FlexLayout className="items-center gap-6">
          <Box className="py-3 pl-3">
            <FlexLayout className="items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
              <Icon color="text-white" icon="IconTruck" size="xl" />
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
              <Pill text="Tegljač" variant="success" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <VehicleActions id={id} name={registration} type={type} />
      </FlexLayout>
      <FlexLayout className="ml-4 gap-9">
        <GeneralInfo vehicle={truck} />
        <VehicleInfo vehicle={truck} />
        <DocumentsSection vehicle={truck} />
      </FlexLayout>
    </FlexLayout>
  );
};
