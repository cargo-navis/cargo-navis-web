import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

import { BackButton } from './BackButton';
import { NewEmployeeForm } from './NewEmployeeForm';

export const NewEmployeePage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Zaposlenik
          </Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/employees" />
          <NewEmployeeForm />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
