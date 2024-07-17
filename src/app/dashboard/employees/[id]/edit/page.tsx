import { getEmployee } from '@/api/employees';
import { Box, Heading } from '@/ui';
import { BackButton } from '@/app/dashboard/employees/new/BackButton';
import { NewEmployeeForm } from '@/app/dashboard/employees/new/NewEmployeeForm';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  const employee = await getEmployee(id);
  if(!employee) return;

  return (
    <Box>
      <Box className="py-5 flex flex-col gap-10">
        <Heading as="h1" variant="text-xl">Edit Employee</Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-10">
        <BackButton />
        <NewEmployeeForm employee={employee} />
      </Box>
    </Box>
  );
}
