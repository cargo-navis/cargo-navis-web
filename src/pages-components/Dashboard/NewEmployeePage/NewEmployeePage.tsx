import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewEmployeeForm } from './NewEmployeeForm';

export const NewEmployeePage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Zaposlenik
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/employees" />
          <NewEmployeeForm />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
