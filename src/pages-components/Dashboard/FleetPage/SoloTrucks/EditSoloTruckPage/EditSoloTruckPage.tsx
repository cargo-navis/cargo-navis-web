import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const EditSoloTruckPage = () => {
  const { query } = useRouter();
  const soloId = query.id;

  const { data: solo } = useVehicle(soloId as string);

  return (
    <DashboardLayout>
      <PageTitle title={solo?.registration} type="Uredi solo kamion" />
      {!solo ? <LoadingPage /> : <MainContent solo={solo} />}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ solo: Vehicle }> = ({ solo }) => {
  return (
    <Box>
      <FlexLayout className="flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Solo Kamion
        </Heading>
      </FlexLayout>
      <FlexLayout className="py-5 flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/solo-trucks" />
        <NewVehicleForm type={VehicleEnum.SOLO_TRUCK} vehicle={solo} />
      </FlexLayout>
    </Box>
  );
};
