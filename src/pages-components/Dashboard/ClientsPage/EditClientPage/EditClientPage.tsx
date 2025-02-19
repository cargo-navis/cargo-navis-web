import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Client } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClient } from '@/lib/hooks';
import { NewClientForm } from '@/pages-components/Dashboard/ClientsPage/NewClientPage/NewClientForm';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Heading } from '@/ui';

export const EditClientPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: client, isLoading } = useClient(id as string);

  return (
    <DashboardLayout>
      {isLoading || !client || !id ? <LoadingPage /> : <MainContent client={client} clientId={id as string} />}
    </DashboardLayout>
  );
};

const MainContent = ({ client, clientId }: { client: Client; clientId: string }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Klijenta
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/clients/${clientId}`} />
        <NewClientForm client={client} />
      </FlexLayout>
    </Box>
  );
};
