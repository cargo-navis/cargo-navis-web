import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';
import { useRouter } from 'next/router';
import { NewVehicleForm } from '../../NewVehicleForm';

export const EditVanPage = () => {
  const { query } = useRouter();
  const vanId = query.id;

  const { data: van } = useVehicle(vanId as string);

  return <DashboardLayout>{!van ? <LoadingPage /> : <MainContent van={van} />}</DashboardLayout>;
};

const MainContent: React.FC<{ van: Vehicle }> = ({ van }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Kombi
        </Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/vans" />
        <NewVehicleForm vehicle={van} type={VehicleEnum.VAN} />
      </Box>
    </Box>
  );
};
