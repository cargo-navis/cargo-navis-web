import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Vehicle } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useScrollRestoration, useSolos } from '@/lib/hooks';
import { Box, Button, DisplayIf, Divider, FlexLayout, Heading, Text, TextInput } from '@/ui';

import { SoloTrucksTable } from './SoloTrucksTable';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Vehicle>>[1] = {
  keys: ['registration', 'brand', 'vehicleLoadType'],
  threshold: 0.35,
};

export const SoloTrucksPage = () => {
  const { solos, isLoading } = useSolos();

  return (
    <DashboardLayout>
      <PageTitle title="Solo kamioni" />
      {isLoading ? <LoadingPage /> : <MainContent solos={solos || []} />}
    </DashboardLayout>
  );
};

const MainContent = ({ solos }: { solos: Vehicle[] }) => {
  const isEmpty = solos.length === 0;
  useScrollRestoration('solo-trucks', { isReady: !isEmpty });
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(solos, FUSE_OPTIONS), [solos]);

  const filteredSolos = useMemo(() => {
    const query = search.trim();
    if (!query) return solos;

    return fuse.search(query).map((result) => result.item);
  }, [solos, search, fuse]);

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
          <Button href="/dashboard/fleet/solo-trucks/new" iconLeft="IconPlus" text="Dodaj Solo Kamion" />
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
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="IconSearch"
                iconRight={search ? 'IconX' : undefined}
                placeholder="Pretraži solo kamione..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <SoloTrucksTable solos={filteredSolos} />
          </>
        )}
      </Box>
    </Box>
  );
};
