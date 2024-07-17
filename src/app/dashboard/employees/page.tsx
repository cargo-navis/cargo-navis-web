import { Box, Button, Heading } from '@/ui';

import { EmployeesTable } from './EmployeesTable';
import { getEmployees } from '@/api/employees';

export default async function Page() {
  const employees = await getEmployees();

  return (
    <Box>
      <Box className="flex items-center justify-between">
        <Heading as="h1" variant="text-xl">Employees</Heading>
        <Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="New Employee" />
      </Box>
      <Box className="py-5">
        <EmployeesTable employees={employees} />
      </Box>
    </Box>
  );
}