import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrucks } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';

import { TrucksTable } from './TrucksTable';

export const TrucksPage = () => {
  const { trucks, isLoading } = useTrucks();

  return <DashboardLayout>{isLoading || !trucks ? <LoadingPage /> : <MainContent trucks={trucks} />}</DashboardLayout>;
};

const MainContent = ({ trucks }: { trucks: Vehicle[] }) => {
  return (
    <Box>
      <Box className="flex items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Tegljači
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            Imate <Text variant="text-m-bold">{trucks.length} tegljača</Text> u svojoj floti.
          </Text>
        </FlexLayout>
        <Button as="a" href="/dashboard/fleet/trucks/new" iconLeft="PlusIcon" text="Dodaj Tegljač" />
      </Box>
      <Box className="py-5">
        <TrucksTable trucks={trucks} />
      </Box>
    </Box>
  );
};
