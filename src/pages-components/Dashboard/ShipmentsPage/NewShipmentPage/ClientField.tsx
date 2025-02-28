import type { Client } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useClients } from '@/lib/hooks';

function mapClientsToOptions(clients: Client[]) {
  return clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));
}

export const ClientField = () => {
  const { data: clients = [] } = useClients();
  const clientOptions = mapClientsToOptions(clients);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Klijent"
      name="clientId"
      options={clientOptions}
      placeholder="Odaberi klijenta..."
    />
  );
};
