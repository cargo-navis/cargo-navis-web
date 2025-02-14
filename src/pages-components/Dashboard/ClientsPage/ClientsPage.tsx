import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Client } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClients } from '@/lib/hooks';
import { ClientsTable } from '@/pages-components/Dashboard/ClientsPage/ClientsTable';
import { Box, Button, FlexLayout, Heading } from '@/ui';

export const ClientsPage = () => {
  const { data, isLoading } = useClients();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent clients={data as Client[]} />}</DashboardLayout>;
};

const MainContent = ({ clients }: { clients: Client[] }) => {
  return (
    <Box>
      <FlexLayout className="items-center justify-between">
        <Heading as="h1" variant="text-xl">
          Klijenti
        </Heading>
        <Button as="a" href="/dashboard/clients/new" iconLeft="PlusIcon" text="Dodaj Klijenta" />
      </FlexLayout>
      <Box className="py-5">
        <ClientsTable clients={clients} />
      </Box>
    </Box>
  );
};
