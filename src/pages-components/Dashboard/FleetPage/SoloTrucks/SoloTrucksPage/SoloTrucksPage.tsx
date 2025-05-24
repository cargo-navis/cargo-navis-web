import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useSolos } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text } from '@/ui';

import { SoloTrucksTable } from './SoloTrucksTable';

export const SoloTrucksPage = () => {
  const { solos, isLoading } = useSolos();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent solos={solos || []} />}</DashboardLayout>;
};

const MainContent = ({ solos }: { solos: Vehicle[] }) => {
  const isEmpty = solos.length === 0;

  return (
    <Box>
      <Box className="flex items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Solo Kamioni
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Divider />
            <Text color="text-color-2" variant="text-m">
              Imate <Text variant="text-m-bold">{solos.length} Solo kamiona</Text> u svojoj floti.
            </Text>
          </DisplayIf>
        </FlexLayout>
        <DisplayIf condition={!isEmpty}>
          <Button as="a" href="/dashboard/fleet/solo-trucks/new" iconLeft="PlusIcon" text="Dodaj Solo Kamion" />
        </DisplayIf>
      </Box>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/fleet/solo-trucks/new"
            buttonText="Dodaj Solo Kamion"
            description="Kada dodate solo kamione, oni će se prikazati ovdje."
            title="🚚 Još nema zapisa o solo kamionima."
          />
        ) : (
          <SoloTrucksTable solos={solos} />
        )}
      </Box>
    </Box>
  );
};
