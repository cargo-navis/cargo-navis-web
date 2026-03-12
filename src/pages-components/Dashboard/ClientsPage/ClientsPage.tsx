import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Client } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClients } from '@/lib/hooks';
import { ClientsTable } from '@/pages-components/Dashboard/ClientsPage/ClientsTable';
import { Box, Button, DisplayIf, FlexLayout, Heading, TextInput } from '@/ui';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Client>>[1] = {
  keys: ['name', 'address.placeName', 'address.streetName'],
  threshold: 0.35,
};

export const ClientsPage = () => {
  const { data, isLoading } = useClients();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent clients={data || []} />}</DashboardLayout>;
};

const MainContent = ({ clients }: { clients: Client[] }) => {
  const isEmpty = clients.length === 0;
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(clients, FUSE_OPTIONS), [clients]);

  const filteredClients = useMemo(() => {
    const query = search.trim();
    if (!query) return clients;

    return fuse.search(query).map((result) => result.item);
  }, [clients, search, fuse]);

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Klijenti
        </Heading>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/clients/new" iconLeft="PlusIcon" text="Dodaj Klijenta" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/clients/new"
            buttonText="Dodaj Klijenta"
            description="Kada dodate klijente, on će se prikazati ovdje."
            title="💼 Još nema zapisa o klijentima."
          />
        ) : (
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                iconLeft="MagnifyingGlassIcon"
                iconRight={search ? 'XMarkIcon' : undefined}
                placeholder="Pretraži klijente..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <ClientsTable clients={filteredClients} />
          </>
        )}
      </Box>
    </Box>
  );
};
