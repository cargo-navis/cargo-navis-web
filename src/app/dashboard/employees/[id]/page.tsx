import { Box, Pill, Text } from '@/ui';
import { getEmployee } from '@/api/employees';
import { Employee } from '@/lib/employees';

import { ContactInfo } from './ContactInfo';
import { OccupationPill } from '@/app/dashboard/employees/OccupationPill';

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
            <Box className="flex gap-4 items-center">
              <Text variant="text-xxl-medium">{`${employee?.firstName} ${employee?.lastName}`}</Text>
              <OccupationPill occupation={employee.position} text={employee.position} />
            </Box>
            <Box className="flex gap-8">
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