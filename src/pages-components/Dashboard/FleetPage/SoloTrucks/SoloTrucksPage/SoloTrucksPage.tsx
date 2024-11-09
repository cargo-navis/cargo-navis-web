import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useSolos } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, Heading, Text } from '@/ui';
import pluralize from 'pluralize';

import { SoloTrucksTable } from './SoloTrucksTable';

export const SoloTrucksPage = () => {
  const { solos, isLoading } = useSolos();

  return <DashboardLayout>{isLoading || !solos ? <LoadingPage /> : <MainContent solos={solos} />}</DashboardLayout>;
};

const MainContent = ({ solos }: { solos: Vehicle[] }) => {
  return (
    <Box>
      <Box className="flex items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Fleet — Solo Trucks
          </Heading>
          <Divider />
          <Text color="text-color-2" variant="text-m">
            There are{' '}
            <Text variant="text-m-bold">
              {solos.length} Solo {pluralize('Truck', solos.length)}
            </Text>{' '}
            in your fleet
          </Text>
        </FlexLayout>
        <Button as="a" href="/dashboard/fleet/solo-trucks/new" iconLeft="PlusIcon" text="New Solo Truck" />
      </Box>
      <Box className="py-5">
        <SoloTrucksTable solos={solos} />
      </Box>
    </Box>
  );
};
