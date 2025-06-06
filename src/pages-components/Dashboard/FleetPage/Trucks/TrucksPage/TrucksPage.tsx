import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrucks } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text } from '@/ui';

import { TrucksTable } from './TrucksTable';

export const TrucksPage = () => {
  const { trucks, isLoading } = useTrucks();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent trucks={trucks || []} />}</DashboardLayout>;
};

const MainContent = ({ trucks }: { trucks: Vehicle[] }) => {
  const isEmpty = trucks.length === 0;

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Tegljači
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Divider />
            <Text color="text-color-2" variant="text-m">
              Imate <Text variant="text-m-bold">{trucks.length} tegljača</Text> u svojoj floti.
            </Text>
          </DisplayIf>
        </FlexLayout>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/fleet/trucks/new" iconLeft="PlusIcon" text="Dodaj Tegljač" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/fleet/trucks/new"
            buttonText="Dodaj Tegljač"
            description="Kada dodate tegljače, oni će se prikazati ovdje."
            title="🚛 Još nema zapisa o tegljačima."
          />
        ) : (
          <TrucksTable trucks={trucks} />
        )}
      </Box>
    </Box>
  );
};
