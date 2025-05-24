import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useEmployees } from '@/lib/hooks/';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import { EmployeesTable } from './EmployeesTable';

export const EmployeesPage = () => {
  const { data, isLoading } = useEmployees();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent employees={data || []} />}</DashboardLayout>;
};

const MainContent = ({ employees }: { employees: Employee[] }) => {
  const isEmpty = employees.length === 0;

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Zaposlenici
        </Heading>
        <DisplayIf condition={!isEmpty}>
          <Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="Dodaj Zaposlenika" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/employees/new"
            buttonText="Dodaj Zaposlenika"
            description="Kada dodate zaposlenike, oni će se prikazati ovdje."
            title="👥 Još nema zapisa o zaposlenicima"
          />
        ) : (
          <EmployeesTable employees={employees} />
        )}
      </Box>
    </Box>
  );
};
