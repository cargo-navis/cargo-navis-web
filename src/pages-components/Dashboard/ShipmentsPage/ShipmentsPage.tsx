import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const ShipmentsPage = () => {
	return (
		<DashboardLayout>
			<Box>
				<Heading as="h1" variant="text-xl">
					Shipments
				</Heading>
			</Box>
		</DashboardLayout>
	);
};
