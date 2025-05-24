import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Contractor } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractors } from '@/lib/hooks';
import { ContractorsTable } from '@/pages-components/Dashboard/ContractorsPage/ContractorsTable';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

export const ContractorsPage = () => {
  const { data, isLoading } = useContractors();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent contractors={data || []} />}</DashboardLayout>;
};

const MainContent = ({ contractors }: { contractors: Contractor[] }) => {
  const isEmpty = contractors.length === 0;

  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Kontraktori
        </Heading>
        <DisplayIf condition={!isEmpty}>
          <Button as="a" href="/dashboard/contractors/new" iconLeft="PlusIcon" text="Dodaj Kontraktora" />
        </DisplayIf>
      </FlexLayout>
      <Box className="py-5">
        {isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/contractors/new"
            buttonText="Dodaj Kontraktora"
            description="Kada dodate prvog kontraktora, on će se prikazati ovdje."
            title="📄 Još nema zapisa o kontraktorima"
          />
        ) : (
          <ContractorsTable contractors={contractors} />
        )}
      </Box>
    </Box>
  );
};
