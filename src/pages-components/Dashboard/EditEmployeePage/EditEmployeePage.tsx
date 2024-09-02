import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

import { BackButton } from '../NewEmployeePage/BackButton';
import { NewEmployeeForm } from '../NewEmployeePage/NewEmployeeForm';
import { employees } from '@/lib/mocks/employees';

export const EditEmployeePage = () => {
  const employee = employees[0];

  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">Edit Employee</Heading>
        </Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <BackButton />
          <NewEmployeeForm employee={employee} />
        </Box>
      </Box>
    </DashboardLayout>
  );
}