import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Contractor } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractor } from '@/lib/hooks';
import { NewContractorForm } from '@/pages-components/Dashboard/ContractorsPage/NewContractorPage/NewContractorForm';
import { Box, FlexLayout, Heading } from '@/ui';

export const EditContractorPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: contractor, isLoading } = useContractor(id as string);

  return (
    <DashboardLayout>
      {isLoading || !contractor || !id ? (
        <LoadingPage />
      ) : (
        <MainContent contractor={contractor} contractorId={id as string} />
      )}
    </DashboardLayout>
  );
};

const MainContent = ({ contractor, contractorId }: { contractor: Contractor; contractorId: string }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Kontraktora
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/contractors/${contractorId}`} />
        <NewContractorForm contractor={contractor} />
      </FlexLayout>
    </Box>
  );
};
