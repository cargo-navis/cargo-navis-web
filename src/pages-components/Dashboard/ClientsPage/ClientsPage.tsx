import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Client } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClients } from '@/lib/hooks';
import { ClientsTable } from '@/pages-components/Dashboard/ClientsPage/ClientsTable';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

export const ClientsPage = () => {
  const { data, isLoading } = useClients();

  return <DashboardLayout>{isLoading ? <LoadingPage /> : <MainContent clients={data || []} />}</DashboardLayout>;
};

const MainContent = ({ clients }: { clients: Client[] }) => {
  const isEmpty = clients.length === 0;

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
          <ClientsTable clients={clients} />
        )}
      </Box>
    </Box>
  );
};
