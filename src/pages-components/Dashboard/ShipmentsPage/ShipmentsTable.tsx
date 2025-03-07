import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import type { Shipment } from '@/lib/api'; // Assuming you have a Shipment type defined
import { useClients, useContractors, useEmployees } from '@/lib/hooks';
import { FlexLayout, Table, Text } from '@/ui'; // Import FlexLayout

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const { data: clients = [] } = useClients(); // Default to empty array if undefined
  const { data: contractors = [] } = useContractors(); // Default to empty array if undefined
  const { data: employees = [] } = useEmployees(); // Default to empty array if undefined

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('orderNumber', {
        header: 'Order Number',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('loadingDate', {
        header: 'Order Date',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('clientId', {
        header: 'Client Name',
        cell: (info) => {
          const clientId = info.getValue();
          const client = clients.find((client) => client.id === clientId);
          return (
            <FlexLayout className="items-center py-2">
              <Text>{client ? client.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('transportContractorId', {
        header: 'Transport Contractor',
        cell: (info) => {
          const contractorId = info.getValue();
          const contractor = contractors.find((contractor) => contractor.id === contractorId);
          return (
            <FlexLayout className="items-center py-2">
              <Text>{contractor ? contractor.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('loadingAddress.name', {
        header: 'Loading Location',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('unloadingAddress.name', {
        header: 'Unloading Location',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('dispatcherId', {
        header: 'Disponent',
        cell: (info) => {
          const employeeId = info.getValue();
          const employee = employees.find((employee) => employee.id === employeeId);
          const fullName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : '—';
          return (
            <FlexLayout className="items-center py-2">
              <Text>{fullName || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
    ];
  }, [clients, contractors, employees]);

  return <Table columns={columns} data={shipments} />;
}
