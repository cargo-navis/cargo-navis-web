import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useTrailers } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { TrailersTable } from './TrailersTable';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Vehicle>>[1] = {
  keys: ['registration', 'brand', 'vehicleLoadType'],
  threshold: 0.35,
};

export const TrailersPage = () => {
  const { trailers, isLoading } = useTrailers();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent trailers={trailers || []} />}</DashboardLayout>;
};

const MainContent = ({ trailers }: { trailers: Vehicle[] }) => {
  const isEmpty = trailers.length === 0;
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(trailers, FUSE_OPTIONS), [trailers]);

  const filteredTrailers = useMemo(() => {
    const query = search.trim();
    if (!query) return trailers;

    return fuse.search(query).map((result) => result.item);
  }, [trailers, search, fuse]);

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="flex-col gap-2">
          <Heading as="h1" variant="text-xl">
            Flota — Poluprikolice
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Divider />
            <Text color="text-color-2" variant="text-m">
              Imate <Text variant="text-m-bold">{trailers.length} poluprikolica</Text> u svojoj floti.
            </Text>
          </DisplayIf>
        </FlexLayout>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/fleet/trailers/new" iconLeft="PlusIcon" text="Dodaj Poluprikolicu" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/fleet/trailers/new"
            buttonText="Dodaj Poluprikolicu"
            description="Kada dodate poluprikolice, one će se prikazati ovdje."
            title="🚛 Još nema zapisa o poluprikolicama"
          />
        ) : (
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="MagnifyingGlassIcon"
                iconRight={search ? 'XMarkIcon' : undefined}
                placeholder="Pretraži poluprikolice..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <TrailersTable trailers={filteredTrailers} />
          </>
        )}
      </Box>
    </Box>
  );
};
