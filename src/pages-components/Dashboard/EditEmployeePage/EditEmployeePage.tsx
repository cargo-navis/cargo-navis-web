import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, LoadingSpinner } from '@/ui';

import { useEmployee } from '@/lib/hooks';
import { useRouter } from 'next/router';
import { BackButton } from '../NewEmployeePage/BackButton';
import { NewEmployeeForm } from '../NewEmployeePage/NewEmployeeForm';

export const EditEmployeePage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: employee } = useEmployee(id as string);

  return (
    <DashboardLayout>
      <Box>
        <Box className="py-5 flex flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Edit Employee
          </Heading>
        </Box>
        {!employee ? (
          <LoadingSpinner />
        ) : (
          <Box className="py-5 flex flex-col gap-[40px]">
            <BackButton targetLocation={`/dashboard/employees/${id}`} />
            <NewEmployeeForm employee={employee} />
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};
