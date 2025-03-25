import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const EditTruckPage = () => {
  const { query } = useRouter();
  const truckId = query.id;

  const { data: truck } = useVehicle(truckId as string);

  return <DashboardLayout>{!truck ? <LoadingPage /> : <MainContent truck={truck} />}</DashboardLayout>;
};

const MainContent: React.FC<{ truck: Vehicle }> = ({ truck }) => {
  return (
    <Box>
      <FlexLayout className="flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Kamion
        </Heading>
      </FlexLayout>
      <FlexLayout className="py-5 flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/trucks" />
        <NewVehicleForm type={VehicleEnum.TRUCK} vehicle={truck} />
      </FlexLayout>
    </Box>
  );
};
