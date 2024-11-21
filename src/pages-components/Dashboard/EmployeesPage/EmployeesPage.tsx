import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { Box, Button, Heading } from '@/ui';

import { useEmployees } from '@/lib/hooks/';
import { EmployeesTable } from './EmployeesTable';

export const EmployeesPage = () => {
  const { data, isLoading } = useEmployees();

  return <DashboardLayout>{isLoading || !data ? <LoadingPage /> : <MainContent employees={data} />}</DashboardLayout>;
};

const MainContent = ({ employees }: { employees: Employee[] }) => {
  return (
    <Box>
      <Box className="flex items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Zaposlenici
        </Heading>
        <Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="Dodaj Zaposlenika" />
      </Box>
      <Box className="py-5">
        <EmployeesTable employees={employees} />
      </Box>
    </Box>
  );
};
