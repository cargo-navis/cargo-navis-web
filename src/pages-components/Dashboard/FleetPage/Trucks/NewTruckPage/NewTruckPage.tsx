import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { VehicleEnum } from '@/lib/api';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewTruckPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Novi kamion" />
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Tegljač
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/trucks" />
          <NewVehicleForm type={VehicleEnum.TRUCK} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
