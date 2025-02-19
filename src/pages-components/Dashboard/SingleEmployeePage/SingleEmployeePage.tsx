import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api/employees.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useEmployee } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { DriverInfo } from '@/pages-components/Dashboard/SingleEmployeePage/DriverInfo';
import { Box, DisplayIf, FlexLayout, Text } from '@/ui';

import { OccupationPill } from '../EmployeesPage/OccupationPill';
import { BackButton } from '../NewEmployeePage/BackButton';
import { ContactInfo } from './ContactInfo';
import { EmployeeActions } from './EmployeeActions';

export const SingleEmployeePage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: employee, isLoading } = useEmployee(id as string);

  return (
    <DashboardLayout>
      {!employee || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent employee={employee} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/employees" />
      <FlexLayout className="justify-between">
        <FlexLayout className="items-start gap-6">
          <Avatar employee={employee} />
          <FlexLayout className="flex-col gap-3 mt-[12px]">
            <FlexLayout className="gap-4 items-center">
              <Text variant="text-xxl-medium">{`${employee?.firstName} ${employee?.lastName}`}</Text>
              <OccupationPill occupation={employee.position} text={employee.position} />
            </FlexLayout>
            <FlexLayout className="gap-8">
              <DisplayIf condition={!!employee.governmentId}>
                <ContactInfo contact={employee.governmentId} contactType="governmentId" />
              </DisplayIf>
              <DisplayIf condition={!!employee.phoneNumber}>
                <ContactInfo contact={employee.phoneNumber} contactType="phone" />
              </DisplayIf>
              <DisplayIf condition={!!employee.email}>
                <ContactInfo contact={employee.email} contactType="email" />
              </DisplayIf>
            </FlexLayout>
            <FlexLayout className="gap-8">
              <ContactInfo contact={getDataPointDateString(employee.dateOfBirth) || '-'} contactType="dateOfBirth" />
              <ContactInfo contact={employee.residenceAddress || '-'} contactType="residenceAddress" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        <EmployeeActions id={employee.id} />
      </FlexLayout>
      <FlexLayout className="ml-4 gap-8">
        <DisplayIf condition={employee.position === 'driver'}>
          <DriverInfo employee={employee} />
        </DisplayIf>
      </FlexLayout>
    </FlexLayout>
  );
};

function Avatar({ employee }: { employee: Employee }) {
  const { firstName, lastName } = employee;

  return (
    <Box className="py-3 pl-3">
      <FlexLayout className="items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
        <Text className="text-light-50" variant="text-l-bold">
          {firstName[0] + lastName[0]}
        </Text>
      </FlexLayout>
    </Box>
  );
}
