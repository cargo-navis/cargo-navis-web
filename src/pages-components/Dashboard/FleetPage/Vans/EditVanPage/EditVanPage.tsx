import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

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
      <FlexLayout className="flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Kombi
        </Heading>
      </FlexLayout>
      <FlexLayout className="py-5 flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/vans" />
        <NewVehicleForm type={VehicleEnum.VAN} vehicle={van} />
      </FlexLayout>
    </Box>
  );
};
