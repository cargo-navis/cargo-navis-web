import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { ViesLookupFlow } from '@/components/vies';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewClientForm } from './NewClientForm';

export const NewClientPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Novi klijent" />
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Klijent
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/clients" />
          <ViesLookupFlow
            manualButtonText="Dodaj klijenta ručno"
            renderForm={(initialValues) => <NewClientForm initialValues={initialValues} />}
            searchTitle="Pretraži klijenta u VIES tražilici"
          />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
