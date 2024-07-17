import { Box, Text } from '@/ui';

import { BackButton } from './BackButton';
import { NewEmployeeForm } from './NewEmployeeForm';

export default async function Page() {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-10">
        <Text variant="text-xxl-medium">New Employee</Text>
      </Box>
      <Box className="py-5 flex flex-col gap-10">
        <BackButton />
        <NewEmployeeForm />
      </Box>
    </Box>
  );
}
