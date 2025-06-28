import type { Client } from '@/lib/api/clients.d';
import type { Employee } from '@/lib/api/employees.d';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, FlexLayout } from '@/ui';
import type { SelectValue } from '@/ui/components/Select/Select';
import { SingleSelectWithLabels } from '@/ui/hocs';

import { invoiceStatusConfig, loadStatusConfig } from '../const';

interface FilterFieldsProps {
  clients: Client[];
  drivers: Employee[];
  selectedClientId: SelectValue;
  selectedDriverId: SelectValue;
  selectedLoadingStatus: SelectValue;
  selectedInvoiceStatus: SelectValue;
  onClientChange: (clientId: SelectValue) => void;
  onDriverChange: (driverId: SelectValue) => void;
  onLoadingStatusChange: (loadingStatus: SelectValue) => void;
  onInvoiceStatusChange: (invoiceStatus: SelectValue) => void;
}

export const FilterFields = ({
  clients,
  drivers,
  selectedClientId,
  selectedDriverId,
  selectedLoadingStatus,
  selectedInvoiceStatus,
  onClientChange,
  onDriverChange,
  onLoadingStatusChange,
  onInvoiceStatusChange,
}: FilterFieldsProps) => {
  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const driverOptions = mapEmployeesToOptions(drivers);

  const loadingStatusOptions = Object.values(LoadStatus).map((status) => ({
    value: status,
    label: loadStatusConfig[status].label,
  }));

  const invoiceStatusOptions = Object.values(InvoiceStatus).map((status) => ({
    value: status,
    label: invoiceStatusConfig[status].label,
  }));

  return (
    <Box className="px-4 pb-4">
      <FlexLayout className="gap-4 flex-col md:flex-row">
        <Box className="flex-1">
          <ClientSideOnly>
            <SingleSelectWithLabels
              isClearable
              isPortal
              isSearchable
              label="Klijent"
              options={clientOptions}
              placeholder="Odaberi klijenta..."
              value={selectedClientId}
              onChange={onClientChange}
            />
          </ClientSideOnly>
        </Box>

        <Box className="flex-1">
          <ClientSideOnly>
            <SingleSelectWithLabels
              isClearable
              isPortal
              isSearchable
              label="Vozač"
              options={driverOptions}
              placeholder="Odaberi vozača..."
              value={selectedDriverId}
              onChange={onDriverChange}
            />
          </ClientSideOnly>
        </Box>

        <Box className="flex-1">
          <ClientSideOnly>
            <SingleSelectWithLabels
              isClearable
              isPortal
              isSearchable
              label="Status utovara"
              options={loadingStatusOptions}
              placeholder="Odaberi status..."
              value={selectedLoadingStatus}
              onChange={onLoadingStatusChange}
            />
          </ClientSideOnly>
        </Box>

        <Box className="flex-1">
          <ClientSideOnly>
            <SingleSelectWithLabels
              isClearable
              isPortal
              isSearchable
              label="Status fakture"
              options={invoiceStatusOptions}
              placeholder="Odaberi status fakture..."
              value={selectedInvoiceStatus}
              onChange={onInvoiceStatusChange}
            />
          </ClientSideOnly>
        </Box>
      </FlexLayout>
    </Box>
  );
};
