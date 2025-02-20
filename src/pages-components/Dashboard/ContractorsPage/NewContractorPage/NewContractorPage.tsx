import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewContractorForm } from './NewContractorForm';

export const NewContractorPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Kontraktor
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/contractors" />
          <NewContractorForm />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
