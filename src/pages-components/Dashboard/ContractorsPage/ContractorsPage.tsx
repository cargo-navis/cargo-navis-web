import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Contractor } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractors } from '@/lib/hooks';
import { ContractorsTable } from '@/pages-components/Dashboard/ContractorsPage/ContractorsTable';
import { Box, Button, FlexLayout, Heading } from '@/ui';

export const ContractorsPage = () => {
  const { data, isLoading } = useContractors();

  return (
    <DashboardLayout>
      {isLoading ? <LoadingPage /> : <MainContent contractors={data as Contractor[]} />}
    </DashboardLayout>
  );
};

const MainContent = ({ contractors }: { contractors: Contractor[] }) => {
  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Kontraktori
        </Heading>
        <Button as="a" href="/dashboard/contractors/new" iconLeft="PlusIcon" text="Dodaj Kontraktora" />
      </FlexLayout>
      <Box className="py-5">
        <ContractorsTable contractors={contractors} />
      </Box>
    </Box>
  );
};
