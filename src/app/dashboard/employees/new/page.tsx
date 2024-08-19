import { Box, Heading } from '@/ui';

import { BackButton } from './BackButton';
import { NewEmployeeForm } from './NewEmployeeForm';

export default async function Page() {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-10">
        <Heading as="h1" variant="text-xl">New Employee</Heading>
      </Box>
      <Box className="py-5 flex flex-col gap-10">
        <BackButton />
        <NewEmployeeForm />
      </Box>
    </Box>
  );
}
