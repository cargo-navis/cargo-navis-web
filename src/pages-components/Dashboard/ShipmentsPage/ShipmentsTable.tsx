import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { Employee, PositionEnum, type Shipment } from '@/lib/api';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { FlexLayout, Table, Text } from '@/ui';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { data: employees = [] } = useEmployees({
    select: (employees: Employee[]) => employees.filter((employee) => employee.position === PositionEnum.Driver),
  });

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('orderNumber', {
        header: 'Broj naloga',
        size: 140,
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('clientId', {
        header: 'Klijent',
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
      columnHelper.accessor('transportContractorId', {
        header: 'Prijevozik',
        cell: (info) => {
          const contractorId = info.getValue();
          const contractor = contractorId ? contractors.find((contractor) => contractor.id === contractorId) : tenant;

          return (
            <FlexLayout className="items-center py-2">
              <Text>{contractor ? contractor.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Cijena',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{info.getValue()}€</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('loadingDate', {
        header: 'Datum utovara',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{getDataPointDateString(info.getValue())}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('unloadingDate', {
        header: 'Datum istovara',
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text>{getDataPointDateString(info.getValue())}</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.display({
        id: 'ldm',
        header: 'LDM',
        size: 100,
        cell: (props) => {
          const { cargo } = props.row.original;
          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm), 0);

          return (
            <FlexLayout className="items-center py-2">
              <Text>{ldmTotal}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'palleteNo',
        header: 'Broj paleta',
        cell: (props) => {
          const { cargo } = props.row.original;
          const palleteNo = cargo.reduce((acc, c) => (acc += c.metadata?.palleteAmount), 0);

          return (
            <FlexLayout className="items-center py-2">
              <Text>{palleteNo || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'weight',
        header: 'Težina',
        cell: (props) => {
          const { cargo } = props.row.original;
          const weight = cargo.reduce((acc, c) => (acc += c.weight), 0);

          return (
            <FlexLayout className="items-center py-2">
              <Text>{weight ? `${weight} kg` : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('vehicleId', {
        header: 'Vozilo',
        cell: (info) => {
          const vehicleId = info.getValue();
          const vehicle = vehicles.find((v) => v.id === vehicleId);
          console.log(vehicle);

          const displayValue = vehicle ? `${vehicle?.registration} (${vehicle?.brand})` : '—';

          return (
            <FlexLayout className="items-center py-2">
              <Text>{displayValue}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('driverId', {
        header: 'Vozač',
        cell: (info) => {
          const driverId = info.getValue();
          const employee = employees.find((employee) => employee.id === driverId);
          const fullName = employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : '—';

          return (
            <FlexLayout className="items-center py-2">
              <Text>{fullName || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
    ];
  }, [clients, contractors, employees, tenant, vehicles]);

  return <Table columns={columns} data={shipments} />;
}
