import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewTrailerPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Nova Poluprikolica
          </Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/trailers" />
          <NewVehicleForm type={VehicleEnum.TRAILER} />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
