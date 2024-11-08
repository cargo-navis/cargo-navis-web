import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicle } from '@/lib/hooks';
import { NewVehicleForm } from '@/pages-components/Dashboard/FleetPage/Trucks/NewTruckPage/NewVehicleForm';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';
import { useRouter } from 'next/router';

export const EditTruckPage = () => {
  const { query } = useRouter();
  const truckId = query.id;

  const { data: truck } = useVehicle(truckId as string);

  return <DashboardLayout>{!truck ? <LoadingPage /> : <MainContent truck={truck} />}</DashboardLayout>;
};

const MainContent: React.FC<{ truck: Vehicle }> = ({ truck }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Edit Truck
        </Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/fleet/trucks" />
        <NewVehicleForm vehicle={truck} />
      </Box>
    </Box>
  );
};
