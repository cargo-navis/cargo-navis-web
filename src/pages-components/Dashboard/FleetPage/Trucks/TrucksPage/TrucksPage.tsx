import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrucks } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';
import pluralize from 'pluralize';

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
            Fleet — Trucks
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            There are{' '}
            <Text variant="text-m-bold">
              {trucks.length} {pluralize('Truck', trucks.length)}
            </Text>{' '}
            in your fleet
          </Text>
        </FlexLayout>
        <Button isDisabled href="/dashboard/fleet/trucks/new" iconLeft="PlusIcon" text="New Truck" />
      </Box>
      <Box className="py-5">
        <TrucksTable trucks={trucks} />
      </Box>
    </Box>
  );
};
