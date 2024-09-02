import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Button, Heading } from '@/ui';
import { Employee } from '@/lib/employees';

import { EmployeesTable } from './EmployeesTable';
import { useSession } from 'next-auth/react';
import { employees as mockEmployees } from '@/lib/mocks/employees';
import { useEffect } from 'react';
import { getEmployees } from '@/lib/api';

export const EmployeesPage = () => {
  const employees: Employee[] = mockEmployees;

  const session = useSession();

  console.log(session);
  // console.log(employees);

  useEffect(() => {
    getEmployees();
  }, []);


  return (
    <DashboardLayout>
      <Box>
        <Box className="flex items-center justify-between">
          <Heading as="h1" variant="text-xl">Employees</Heading>
          {/*<Button iconLeft="LockOpenIcon" text="Log in with Ponta" onClick={loginWithPonta} />*/}
          <Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="New Employee" />
        </Box>
        <Box className="py-5">
          <EmployeesTable employees={employees} />
        </Box>
      </Box>
    </DashboardLayout>
  );
}