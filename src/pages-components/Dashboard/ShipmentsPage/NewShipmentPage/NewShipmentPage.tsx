import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Heading } from '@/ui';

export const NewShipmentPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Box className="flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Nalog
          </Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          {/*  NewShipmentForm */}
        </Box>
      </Box>
    </DashboardLayout>
  );
};
