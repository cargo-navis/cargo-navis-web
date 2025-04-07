import type { Client } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useClients, useCurrentTenant } from '@/lib/hooks';

function mapClientsToOptions(clients: Client[]) {
  return clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));
}

export const ClientField = () => {
  const { data: clients = [] } = useClients();
  const clientOptions = mapClientsToOptions(clients);

  const { data: tenant } = useCurrentTenant();
  const tenantOption = { value: tenant?.id || '', label: tenant?.name || '' };

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Klijent"
      name="clientId"
      options={[{ options: [tenantOption] }, ...clientOptions]}
      placeholder="Odaberi klijenta..."
      rules={{ required: true }}
    />
  );
};
