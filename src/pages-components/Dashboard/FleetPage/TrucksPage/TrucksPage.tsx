import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicles } from '@/lib/hooks';
import { TrucksTable } from '@/pages-components/Dashboard/FleetPage/TrucksPage/TrucksTable';
import { Box, Button, Heading } from '@/ui';

export const TrucksPage = () => {
  const { data, isLoading } = useVehicles();

  return <DashboardLayout>{isLoading || !data ? <LoadingPage /> : <MainContent trucks={data} />}</DashboardLayout>;
};

const MainContent = ({ trucks }: { trucks: Vehicle[] }) => {
  return (
    <Box>
      <Box className="flex items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Fleet — Trucks
        </Heading>
        <Button isDisabled href="/dashboard/fleet/trucks/new" iconLeft="PlusIcon" text="New Truck" />
      </Box>
      <Box className="py-5">
        <TrucksTable trucks={trucks} />
      </Box>
    </Box>
  );
};
