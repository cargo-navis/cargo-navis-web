import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleEnum } from '@/lib/api';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewVehicleForm } from '../../NewVehicleForm';

export const NewTrailerPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Nova Poluprikolica
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/fleet/trailers" />
          <NewVehicleForm type={VehicleEnum.TRAILER} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
