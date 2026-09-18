import { FormSingleSelect } from '@/lib/components/form';
import { useClients, useFuseSelectFilter } from '@/lib/hooks';

const FUSE_OPTIONS = { keys: ['name'] };

export const ClientField = () => {
  const { data: clients = [] } = useClients();
  const { data: filtered, onInputChange } = useFuseSelectFilter(clients, FUSE_OPTIONS);

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
