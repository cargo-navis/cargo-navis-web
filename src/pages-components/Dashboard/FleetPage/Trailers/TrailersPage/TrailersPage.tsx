import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrailers } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';

import { TrailersTable } from './TrailersTable';

export const TrailersPage = () => {
  const { trailers, isLoading } = useTrailers();

  return (
    <DashboardLayout>{isLoading || !trailers ? <LoadingPage /> : <MainContent trailers={trailers} />}</DashboardLayout>
  );
};

const MainContent = ({ trailers }: { trailers: Vehicle[] }) => {
  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Poluprikolice
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            Imate <Text variant="text-m-bold">{trailers.length} poluprikolica</Text> u svojoj floti.
          </Text>
        </FlexLayout>
        <Button as="a" href="/dashboard/fleet/trailers/new" iconLeft="PlusIcon" text="Dodaj Poluprikolicu" />
      </FlexLayout>
      <Box className="py-5">
        <TrailersTable trailers={trailers} />
      </Box>
    </Box>
  );
};
