import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewSoloTruckPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            New Solo Truck
          </Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/solo-trucks" />
          <NewVehicleForm type={VehicleEnum.SOLO_TRUCK} />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
