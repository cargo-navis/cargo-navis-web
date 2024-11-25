import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';
import { useRouter } from 'next/router';
import { NewVehicleForm } from '../../NewVehicleForm';

export const EditSoloTruckPage = () => {
  const { query } = useRouter();
  const soloId = query.id;

  const { data: solo } = useVehicle(soloId as string);

  return <DashboardLayout>{!solo ? <LoadingPage /> : <MainContent solo={solo} />}</DashboardLayout>;
};

const MainContent: React.FC<{ solo: Vehicle }> = ({ solo }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Solo Kamion
        </Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/solo-trucks" />
        <NewVehicleForm vehicle={solo} type={VehicleEnum.SOLO_TRUCK} />
      </Box>
    </Box>
  );
};
