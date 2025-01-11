import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewVanPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Kombi
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/vans" />
          <NewVehicleForm type={VehicleEnum.VAN} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
