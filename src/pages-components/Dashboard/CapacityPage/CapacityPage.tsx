import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const CapacityPage = () => {
	return (
		<DashboardLayout>
			<Box>
				<Heading as="h1" variant="text-xl">
					Trucks Capacity
				</Heading>
			</Box>
		</DashboardLayout>
	);
};
