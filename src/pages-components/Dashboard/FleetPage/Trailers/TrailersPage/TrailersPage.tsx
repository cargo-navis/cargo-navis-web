import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrailers } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';
import pluralize from 'pluralize';

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
      <Box className="flex items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Fleet — Trailers
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            There are{' '}
            <Text variant="text-m-bold">
              {trailers.length} {pluralize('Trailers', trailers.length)}
            </Text>{' '}
            in your fleet
          </Text>
        </FlexLayout>
        <Button isDisabled href="/dashboard/fleet/trailers/new" iconLeft="PlusIcon" text="New Trailer" />
      </Box>
      <Box className="py-5">
        <TrailersTable trailers={trailers} />
      </Box>
    </Box>
  );
};
