import { createColumnHelper } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { type Shipment } from '@/lib/api';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { formatDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { FlexLayout, Table, Text } from '@/ui';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { data: employees = [] } = useEmployees();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('orderNumber', {
        header: 'Broj naloga',
        enableSorting: false,
        size: 140,
        cell: (info) => (
          <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('clientId', {
        header: 'Klijent',
        enableSorting: false,
        cell: (info) => {
          const clientId = info.getValue();
          const client = clients.find((client) => client.id === clientId);
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{client ? client.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('transportContractorId', {
        header: 'Prijevozik',
        enableSorting: false,
        cell: (info) => {
          const contractorId = info.getValue();
          const contractor =
            (contractorId && contractors.find((contractor) => contractor.id === contractorId)) || tenant;

          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{contractor ? contractor.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Cijena',
        enableSorting: true,
        sortingFn: 'basic',
        cell: (info) => (
          <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
            <Text>{info.getValue()}€</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('loadingDate', {
        header: 'Datum utovara',
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = new Date(rowA.original.loadingDate).getTime();
          const b = new Date(rowB.original.loadingDate).getTime();
          return a < b ? -1 : a > b ? 1 : 0;
        },
        cell: (info) => {
          const date = info.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{date ? formatDateString(date, 'DD.MM.YYYY') : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('unloadingDate', {
        header: 'Datum istovara',
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = new Date(rowA.original.unloadingDate).getTime();
          const b = new Date(rowB.original.unloadingDate).getTime();
          return a < b ? -1 : a > b ? 1 : 0;
        },
        cell: (info) => {
          const date = info.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{date ? formatDateString(date, 'DD.MM.YYYY') : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'ldm',
        enableSorting: false,
        header: 'LDM',
        size: 100,
        cell: (props) => {
          const { cargo } = props.row.original;

          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm), 0);
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{roundLdmValue(ldmTotal) || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'palleteNo',
        enableSorting: false,
        header: 'Broj paleta',
        cell: (props) => {
          const { cargo } = props.row.original;
          const palleteNo = cargo.reduce((acc, c) => {
            // For nonstandard cargo, we assume 1 palette per cargo
            const palleteAmount = c.metadata?.palleteAmount || 1;
            return (acc += palleteAmount);
          }, 0);

          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{palleteNo || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor((row) => row.cargo.reduce((acc, c) => acc + (c.weight || 0), 0), {
        id: 'weight',
        header: 'Težina',
        enableSorting: true,
        sortingFn: 'basic',
        cell: (props) => {
          const weight = props.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{weight ? `${weight} kg` : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('vehicleId', {
        header: 'Vozilo',
        enableSorting: false,
        cell: (info) => {
          const vehicleId = info.getValue();
          const vehicle = vehicles.find((v) => v.id === vehicleId);
          const displayValue = vehicle ? `${vehicle?.registration} (${vehicle?.brand})` : '—';
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{displayValue}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('driverId', {
        header: 'Vozač',
        enableSorting: false,
        cell: (info) => {
          const driverId = info.getValue();
          const employee = employees.find((employee) => employee.id === driverId);
          const fullName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : '—';
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{fullName || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('dispatcherId', {
        header: 'Disponent',
        enableSorting: false,
        cell: (info) => {
          const dispatcherId = info.getValue();
          const employee = employees.find((employee) => employee.id === dispatcherId);

          const fullName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : '—';
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{fullName || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
    ];
  }, [clients, contractors, employees, tenant, vehicles]);

  const handleRowClick = (shipment: Shipment) => {
    router.push(`/dashboard/shipments/${shipment.id}`);
  };

  return <Table columns={columns} data={shipments} onRowClick={handleRowClick} />;
}
