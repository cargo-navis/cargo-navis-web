import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Heading } from '@/ui';
import { NewShipmentForm } from './NewShipmentForm';

export const NewShipmentPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Nalog
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          <NewShipmentForm />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
