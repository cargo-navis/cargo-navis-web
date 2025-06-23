import { PositionEnum } from '@/lib/api';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients, useEmployees } from '@/lib/hooks';
import { Box, FlexLayout, SingleSelect } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';

interface ShipmentsFilterProps {
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  onClientChange: (clientId: SelectValue) => void;
  onDriverChange: (driverId: SelectValue) => void;
}

export const ShipmentsFilter = ({
  selectedClientId,
  onClientChange,
  selectedDriverId,
  onDriverChange,
}: ShipmentsFilterProps) => {
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const driverOptions = employees
    .filter((employee) => employee.position === PositionEnum.Driver)
    .map((driver) => ({
      value: driver.id,
      label: `${driver.firstName} ${driver.lastName}`,
    }));

  return (
    <FlexLayout className="mt-4 gap-4">
      <Box className="w-[400px] z-11">
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
      <Box className="w-[400px] z-11">
        <ClientSideOnly>
          <SingleSelect
            isClearable
            isPortal
            isSearchable
            options={driverOptions}
            placeholder="Filtriraj po vozaču..."
            value={selectedDriverId}
            onChange={onDriverChange}
          />
        </ClientSideOnly>
      </Box>
    </FlexLayout>
  );
};
