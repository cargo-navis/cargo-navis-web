import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Button, Heading, LoadingSpinner } from '@/ui';

import { useEmployees } from '@/lib/hooks/';
import { EmployeesTable } from './EmployeesTable';

export const EmployeesPage = () => {
	const { data, isLoading } = useEmployees();

	return (
		<DashboardLayout>
			<Box>
				<Box className="flex items-center justify-between">
					<Heading as="h1" variant="text-xl">
						Employees
					</Heading>
					<Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="New Employee" />
				</Box>
				<Box className="py-5">{isLoading || !data ? <LoadingSpinner /> : <EmployeesTable employees={data} />}</Box>
			</Box>
		</DashboardLayout>
	);
};
