import { Box, Button, Heading } from '@/ui';

import { EmployeesTable } from './EmployeesTable';
import { Employee } from '@/lib/employees';
import { getEmployees } from './actions';

export default async function Page() {
  const employees = await getEmployees();
  // const employees: Employee[] = [];

  console.log(employees);

  return (
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
  );
}