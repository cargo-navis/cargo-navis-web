import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVans } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';

import { VansTable } from './VansTable';

export const VansPage = () => {
  const { vans, isLoading } = useVans();

  return <DashboardLayout>{isLoading || !vans ? <LoadingPage /> : <MainContent vans={vans} />}</DashboardLayout>;
};

const MainContent = ({ vans }: { vans: Vehicle[] }) => {
  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Kombiji
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            Imate <Text variant="text-m-bold">{vans.length} kombija</Text> u svojoj floti.
          </Text>
        </FlexLayout>
        <Button as="a" href="/dashboard/fleet/vans/new" iconLeft="PlusIcon" text="Dodaj Kombi" />
      </FlexLayout>
      <Box className="py-5">
        <VansTable vans={vans} />
      </Box>
    </Box>
  );
};
