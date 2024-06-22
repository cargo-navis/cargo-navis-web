import { Box, Heading } from '@/ui';

import { EmployeesTable } from './EmployeesTable';
import { getEmployees } from '@/api/employees';

export default async function Page() {
  const employees = await getEmployees();

  return (
    <Box>
      <Heading as="h1" variant="text-xl">Employees</Heading>
      <Box className="py-5">
        <EmployeesTable employees={employees} />
      </Box>
    </Box>
  );
}