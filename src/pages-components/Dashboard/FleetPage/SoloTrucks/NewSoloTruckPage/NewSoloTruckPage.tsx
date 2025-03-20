import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewSoloTruckPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Solo Kamion
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/solo-trucks" />
          <NewVehicleForm type={VehicleEnum.SOLO_TRUCK} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
