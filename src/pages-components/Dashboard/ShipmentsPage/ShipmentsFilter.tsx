import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients } from '@/lib/hooks';
import { Box, SingleSelect } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';

interface ShipmentsFilterProps {
  selectedClientId: SelectValue;
  onClientChange: (clientId: SelectValue) => void;
}

export const ShipmentsFilter = ({ selectedClientId, onClientChange }: ShipmentsFilterProps) => {
  const { data: clients = [] } = useClients();

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  return (
    <Box className="mt-4 w-[400px] z-11">
      <ClientSideOnly>
        <SingleSelect
          isClearable
          isPortal
          isSearchable
          options={clientOptions}
          placeholder="Filtriraj po klijentu..."
          value={selectedClientId}
          onChange={onClientChange}
        />
      </ClientSideOnly>
    </Box>
  );
};
