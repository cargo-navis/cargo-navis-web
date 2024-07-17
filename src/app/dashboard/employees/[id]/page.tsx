import { Box, Text } from '@/ui';
import { getEmployee } from '@/api/employees';
import { Employee } from '@/lib/employees';

import { ContactInfo } from './ContactInfo';
import { OccupationPill } from '@/app/dashboard/employees/OccupationPill';
import { CategoryLabel } from '@/app/dashboard/employees/CategoryLabel';
import { Icon } from '@/ui/components/Icon';

import { EmployeeActions } from './EmployeeActions';

type PageProps = {
  params: { id: string };
}


export default async function Page({ params }: PageProps) {
  const id = params.id;
  const employee = await getEmployee(id);

  if(!employee) return;

  return (
    <Box>
      <Box className="py-5 flex flex-col gap-10">
        <Box className="flex justify-between">
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
          <EmployeeActions id={id} />
        </Box>
        <Box className="ml-[116px]">
          {employee.position === 'driver' && <DriverProfile employee={employee} />}
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

interface DriverProfileProps {
  employee: Employee;
}

const DriverProfile: React.FC<DriverProfileProps> = ({ employee }) => {
  const expiredDate = new Date(employee.driverLicenceExpirationDate as string);
  const formattedDate = new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(expiredDate)

  return (
    <Box className="border border-teal-600 pl-4 pr-10 py-2 rounded-s flex flex-col gap-4 w-max">
      <Box className="flex flex-col gap-1">
        <Box className="flex gap-2 items-center">
          <Text color="text-color-1" variant="text-l-medium">ADR:</Text>
          {employee.adr
            ? <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
            : <Icon className="text-red-500" icon="XCircleIcon" size="l" />
          }
        </Box>
      </Box>
      <Box className="flex flex-col gap-1">
        <Box className="flex gap-6 items-center">
          <Text color="text-color-1" variant="text-m-medium">Driver&apos;s Categories:</Text>
          <Box className="flex gap-1 items-center">
            {employee.driverLicenceCategories?.map(l => <CategoryLabel category={l} key={l} />)}
          </Box>
        </Box>
        <Box className="flex items-center gap-2">
          <Text color="text-color-3" variant="text-s">Expires at:</Text>
          <Text color="text-color-2" variant="text-s-bold">{formattedDate}</Text>
        </Box>
      </Box>
    </Box>
  );
}