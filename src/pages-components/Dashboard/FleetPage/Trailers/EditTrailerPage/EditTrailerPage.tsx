import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';
import { useRouter } from 'next/router';
import { NewVehicleForm } from '../../NewVehicleForm';

export const EditTrailerPage = () => {
  const { query } = useRouter();
  const trailerId = query.id;

  const { data: trailer } = useVehicle(trailerId as string);

  return <DashboardLayout>{!trailer ? <LoadingPage /> : <MainContent trailer={trailer} />}</DashboardLayout>;
};

const MainContent: React.FC<{ trailer: Vehicle }> = ({ trailer }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Poluprikolicu
        </Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/trailers" />
        <NewVehicleForm vehicle={trailer} type={VehicleEnum.TRAILER} />
      </Box>
    </Box>
  );
};
