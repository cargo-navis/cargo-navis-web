import { useMemo } from 'react';

import type { Client } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useClients, useCurrentTenant, useFuseSelectFilter } from '@/lib/hooks';

const FUSE_OPTIONS = { keys: ['name'] };

export const ClientField = () => {
  const { data: clients = [] } = useClients();
  const { data: tenant } = useCurrentTenant();

  const allClients = useMemo(
    () => [{ id: tenant?.id || '', name: tenant?.name || '' } as Client, ...clients],
    [tenant, clients]
  );
  const { data: filtered, onInputChange } = useFuseSelectFilter(allClients, FUSE_OPTIONS);

  const options = filtered.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Klijent"
      name="clientId"
      options={options}
      placeholder="Odaberi klijenta..."
      rules={{ required: true }}
      onInputChange={onInputChange}
    />
  );
};
