import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewVanPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Kombi
          </Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/vans" />
          <NewVehicleForm type={VehicleEnum.VAN} />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
