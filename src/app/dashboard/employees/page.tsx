import { Box, Heading } from '@/ui';
import { getEmployees } from '@/api/employees';

export default async function Page() {
  const employees = await getEmployees();

  return (
    <Box>
      <Heading as="h1" variant="text-xl">Employees</Heading>
      <Box as="ul" className="list-decimal">
        {employees.map(e => {
          return <Box as="li" key={e.id}>{`${e.firstName} ${e.lastName}`}</Box>
        })}
      </Box>
    </Box>
  );
}