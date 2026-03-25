import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useScrollRestoration, useVans } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { VansTable } from './VansTable';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Vehicle>>[1] = {
  keys: ['registration', 'brand', 'vehicleLoadType'],
  threshold: 0.35,
};

export const VansPage = () => {
  const { vans, isLoading } = useVans();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent vans={vans || []} />}</DashboardLayout>;
};

const MainContent = ({ vans }: { vans: Vehicle[] }) => {
  const isEmpty = vans.length === 0;
  useScrollRestoration('vans', { isReady: !isEmpty });
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(vans, FUSE_OPTIONS), [vans]);

  const filteredVans = useMemo(() => {
    const query = search.trim();
    if (!query) return vans;

    return fuse.search(query).map((result) => result.item);
  }, [vans, search, fuse]);

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Kombiji
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Divider />
            <Text color="text-color-2" variant="text-m">
              Imate <Text variant="text-m-bold">{vans.length} kombija</Text> u svojoj floti.
            </Text>
          </DisplayIf>
        </FlexLayout>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/fleet/vans/new" iconLeft="PlusIcon" text="Dodaj Kombi" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/fleet/vans/new"
            buttonText="Dodaj Kombi"
            description="Kada dodate kombije, oni će se prikazati ovdje."
            title="🚐 Još nema zapisa o kombijima."
          />
        ) : (
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="MagnifyingGlassIcon"
                iconRight={search ? 'XMarkIcon' : undefined}
                placeholder="Pretraži kombije..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <VansTable vans={filteredVans} />
          </>
        )}
      </Box>
    </Box>
  );
};
