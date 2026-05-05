import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Contractor } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractors, useScrollRestoration } from '@/lib/hooks';
import { ContractorsTable } from '@/pages-components/Dashboard/ContractorsPage/ContractorsTable';
import { Box, Button, DisplayIf, FlexLayout, Heading, TextInput } from '@/ui';

const FUSE_OPTIONS: ConstructorParameters<typeof Fuse<Contractor>>[1] = {
  keys: ['name', 'address.placeName', 'address.streetName'],
  threshold: 0.35,
};

export const ContractorsPage = () => {
  const { data, isLoading } = useContractors();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent contractors={data || []} />}</DashboardLayout>;
};

const MainContent = ({ contractors }: { contractors: Contractor[] }) => {
  const isEmpty = contractors.length === 0;
  useScrollRestoration('contractors', { isReady: !isEmpty });
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(contractors, FUSE_OPTIONS), [contractors]);

  const filteredContractors = useMemo(() => {
    const query = search.trim();
    if (!query) return contractors;

    return fuse.search(query).map((result) => result.item);
  }, [contractors, search, fuse]);

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Kontraktori
        </Heading>
        <DisplayIf condition={!isEmpty}>
          <Button href="/dashboard/contractors/new" iconLeft="IconPlus" text="Dodaj Kontraktora" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/contractors/new"
            buttonText="Dodaj Kontraktora"
            description="Kada dodate kontraktore, oni će se prikazati ovdje."
            title="📑 Još nema zapisa o kontraktorima."
          />
        ) : (
          <>
            <Box className="max-w-xs mb-4">
              <TextInput
                autoFocus
                iconLeft="IconSearch"
                iconRight={search ? 'IconX' : undefined}
                placeholder="Pretraži kontraktore..."
                value={search}
                onChange={setSearch}
                onClickIconRight={() => setSearch('')}
              />
            </Box>
            <ContractorsTable contractors={filteredContractors} />
          </>
        )}
      </Box>
    </Box>
  );
};
