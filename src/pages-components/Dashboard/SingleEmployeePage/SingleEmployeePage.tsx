import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Employee } from '@/lib/api/employees.d';
import { Box, DisplayIf, Icon, LoadingSpinner, Text } from '@/ui';

import { ContactInfo } from './ContactInfo';
import { EmployeeActions } from './EmployeeActions';

import { useEmployee } from '@/lib/hooks';
import { useRouter } from 'next/router';
import { CategoryLabel } from '../EmployeesPage/CategoryLabel';
import { OccupationPill } from '../EmployeesPage/OccupationPill';
import { BackButton } from '../NewEmployeePage/BackButton';

export const SingleEmployeePage = () => {
	const { query } = useRouter();
	const id = query.id;

	const { data: employee } = useEmployee(id as string);

	return (
		<DashboardLayout>
			<Box>{!employee ? <LoadingSpinner /> : <MainContent employee={employee} />}</Box>
		</DashboardLayout>
	);
};

const MainContent: React.FC<{ employee: Employee }> = ({ employee }) => {
	return (
		<Box className="py-5 flex flex-col gap-5">
			<BackButton targetLocation="/dashboard/employees" />
			<Box className="flex justify-between">
				<Box className="flex items-start gap-6">
					<Avatar employee={employee} />
					<Box className="flex flex-col gap-3 mt-[12px]">
						<Box className="flex gap-4 items-center">
							<Text variant="text-xxl-medium">{`${employee?.firstName} ${employee?.lastName}`}</Text>
							<OccupationPill occupation={employee.position} text={employee.position} />
						</Box>
						<Box className="flex gap-8">
							<DisplayIf condition={!!employee.governmentId}>
								<ContactInfo contact={employee.governmentId} contactType="governmentId" />
							</DisplayIf>
							<DisplayIf condition={!!employee.phoneNumber}>
								<ContactInfo contact={employee.phoneNumber} contactType="phone" />
							</DisplayIf>
							<DisplayIf condition={!!employee.email}>
								<ContactInfo contact={employee.email} contactType="email" />
							</DisplayIf>
						</Box>
					</Box>
				</Box>
				<EmployeeActions id={employee.id} />
			</Box>
			<Box className="ml-[116px]">
				<DisplayIf condition={employee.position === 'driver'}>
					<DriverProfile employee={employee} />
				</DisplayIf>
			</Box>
		</Box>
	);
};

function Avatar({ employee }: { employee: Employee }) {
	const { firstName, lastName } = employee;

	return (
		<Box className="py-3 pl-3">
			<Box className="flex items-center justify-center w-[80px] h-[80px] rounded-circle bg-teal-900">
				<Text variant="text-l-bold" className="text-light-50">
					{firstName[0] + lastName[0]}
				</Text>
			</Box>
		</Box>
	);
}

interface DriverProfileProps {
	employee: Employee;
}

const DriverProfile: React.FC<DriverProfileProps> = ({ employee }) => {
	const expiredDate = new Date(employee.driverLicenceExpiryDate as string);
	const formattedDate = new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(expiredDate);

	return (
		<Box className="border border-teal-600 pl-4 pr-10 py-2 rounded-s flex flex-col gap-4 w-max">
			<Box className="flex flex-col gap-1">
				<Box className="flex gap-2 items-center">
					<Text color="text-color-1" variant="text-l-medium">
						ADR:
					</Text>
					{employee.adr ? (
						<Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
					) : (
						<Icon className="text-red-500" icon="XCircleIcon" size="l" />
					)}
				</Box>
			</Box>
			<Box className="flex flex-col gap-1">
				<Box className="flex gap-6 items-center">
					<Text color="text-color-1" variant="text-m-medium">
						Driver&apos;s Categories:
					</Text>
					<Box className="flex gap-1 items-center">
						{employee.driverLicenceCategories?.map((l: string) => (
							<CategoryLabel category={l} key={l} />
						))}
					</Box>
				</Box>
				<Box className="flex items-center gap-2">
					<Text color="text-color-3" variant="text-s">
						Expires at:
					</Text>
					<Text color="text-color-2" variant="text-s-bold">
						{formattedDate}
					</Text>
				</Box>
			</Box>
		</Box>
	);
};
