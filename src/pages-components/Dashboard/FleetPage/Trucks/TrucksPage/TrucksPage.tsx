import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useScrollRestoration, useTrucks } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { TrucksTable } from './TrucksTable';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Vehicle>>[1] = {
  keys: ['registration', 'brand', 'vehicleLoadType'],
  threshold: 0.35,
};

export const TrucksPage = () => {
  const { trucks, isLoading } = useTrucks();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent trucks={trucks || []} />}</DashboardLayout>;
};

const MainContent = ({ trucks }: { trucks: Vehicle[] }) => {
  const isEmpty = trucks.length === 0;
  useScrollRestoration('trucks', { isReady: !isEmpty });
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(trucks, FUSE_OPTIONS), [trucks]);

  const filteredTrucks = useMemo(() => {
    const query = search.trim();
    if (!query) return trucks;

    return fuse.search(query).map((result) => result.item);
  }, [trucks, search, fuse]);

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
          <Button href="/dashboard/fleet/trucks/new" iconLeft="IconPlus" text="Dodaj Tegljač" />
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
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="IconSearch"
                iconRight={search ? 'IconX' : undefined}
                placeholder="Pretraži tegljače..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <TrucksTable trucks={filteredTrucks} />
          </>
        )}
      </Box>
    </Box>
  );
};
