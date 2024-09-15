import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { trucks } from '@/lib/mocks/trucks';
import { TrucksTable } from '@/pages-components/Dashboard/FleetPage/TrucksPage/TrucksTable';
import { Box, Button, Heading, LoadingSpinner } from '@/ui';

export const TrucksPage = () => {
  // const { data, isLoading } = useEmployees();
  const data = trucks;
  const isLoading = false;

  return (
    <DashboardLayout>
      <Box>
        <Box className="flex items-center justify-between">
          <Heading as="h1" variant="text-xl">
            Fleet — Trucks
          </Heading>
          <Button as="a" href="/dashboard/employees/new" iconLeft="PlusIcon" text="New Employee" />
        </Box>
        <Box className="py-5">{isLoading || !data ? <LoadingSpinner /> : <TrucksTable trucks={data} />}</Box>
      </Box>
    </DashboardLayout>
  );
};
