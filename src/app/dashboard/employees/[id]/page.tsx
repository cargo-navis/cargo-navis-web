import { Box, Text } from '@/ui';
import { getEmployee } from '@/api/employees';
import { Employee } from '@/lib/employees';

import { ContactInfo } from './ContactInfo';

type PageProps = {
  params: { id: string };
}


export default async function Page({ params }: PageProps) {
  const id = params.id;
  const employee = await getEmployee(id);

  if(!employee) return;

  return (
    <Box>
      <Box className="py-5">
        <Box className="flex items-start gap-6">
          <Avatar employee={employee} />
          <Box className="flex flex-col gap-3 mt-[12px]">
            <Text variant="text-xxl-medium">{`${employee?.firstName} ${employee?.lastName}`}</Text>
            <Box className="flex gap-10">
              <ContactInfo contact={employee.governmentId} contactType="governmentId" />
              <ContactInfo contact={employee.phoneNumber} contactType="phone" />
              <ContactInfo contact={employee.email} contactType="email" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Avatar({ employee }: { employee: Employee }) {
  const { firstName, lastName } = employee;

  return (
    <Box className="py-3 pl-3">
      <Box className="flex items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
        <Text variant="text-l-bold" className="text-light-50">{firstName[0]+lastName[0]}</Text>
      </Box>
    </Box>
  )
}