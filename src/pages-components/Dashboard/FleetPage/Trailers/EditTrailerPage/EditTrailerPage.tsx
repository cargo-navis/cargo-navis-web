import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

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
      <FlexLayout className="flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Poluprikolicu
        </Heading>
      </FlexLayout>
      <FlexLayout className="py-5 flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/trailers" />
        <NewVehicleForm type={VehicleEnum.TRAILER} vehicle={trailer} />
      </FlexLayout>
    </Box>
  );
};
