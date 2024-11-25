import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { Box, Heading } from '@/ui';

import { useEmployee } from '@/lib/hooks';
import { useRouter } from 'next/router';
import { BackButton } from '../NewEmployeePage/BackButton';
import { NewEmployeeForm } from '../NewEmployeePage/NewEmployeeForm';

export const EditEmployeePage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: employee, isLoading } = useEmployee(id as string);

  return (
    <DashboardLayout>
      {isLoading || !employee || !id ? <LoadingPage /> : <MainContent employee={employee} employeeId={id as string} />}
    </DashboardLayout>
  );
};

const MainContent = ({ employee, employeeId }: { employee: Employee; employeeId: string }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Edit Employee
        </Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/employees/${employeeId}`} />
        <NewEmployeeForm employee={employee} />
      </Box>
    </Box>
  );
};
