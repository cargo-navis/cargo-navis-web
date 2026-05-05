import { createColumnHelper } from '@tanstack/react-table';
import groupBy from 'lodash/groupBy';
import Link from 'next/link';
import { useMemo } from 'react';

import { AlertsTooltip } from '@/components/alerts/AlertsTooltip';
import { type Employee, MessageChannelEnum, PositionEnum } from '@/lib/api/employees.d';
import { useEmployeeAlerts } from '@/lib/hooks';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { Box, DisplayIf, FlexLayout, Icon2, Table, Text } from '@/ui';

import { CategoryLabel } from './CategoryLabel';
import { OccupationPill } from './OccupationPill';

const columnHelper = createColumnHelper<Employee>();

export function EmployeesTable({ employees }: { employees?: Employee[] }) {
  const { data } = useEmployeeAlerts();
  const groupedAlerts = groupBy(data || [], 'alertable.id');

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'avatar',
        size: 100,
        cell: (props) => {
          const { firstName, lastName, id } = props.row.original;

          return (
            <Link href={`/dashboard/employees/${id}`}>
              <Box className="py-3 pl-3">
                <FlexLayout className="items-center justify-center w-[50px] h-[50px] rounded-circle bg-teal-900">
                  <Text className="text-light-50 group-hover/cell:text-teal-600" variant="text-s-medium">
                    {firstName[0] + lastName[0]}
                  </Text>
                </FlexLayout>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.accessor((row) => row.fullName, {
        id: 'fullName',
        header: 'Ime',
        size: 275,
        enableSorting: false,
        cell: (props) => {
          const name = props.getValue();
          const { positions, id } = props.row.original;

          const employeeAlerts = groupedAlerts[id];

          return (
            <Link href={`/dashboard/employees/${id}`}>
              <Box className="py-3">
                <FlexLayout className="flex-col gap-1">
                  <FlexLayout className="gap-3 items-center">
                    <Text className="group-hover/cell:text-teal-600" color="text-color-1" variant="text-m-bold">
                      {name}
                    </Text>
                    {employeeAlerts && (
                      <AlertsTooltip alerts={employeeAlerts}>
                        <Icon2 color="text-red-500" icon="IconAlertTriangle" size="l" />
                      </AlertsTooltip>
                    )}
                  </FlexLayout>
                  <FlexLayout className="items-center gap-2">
                    {positions.map((p) => (
                      <OccupationPill key={p} occupation={p} size="s" text={p} />
                    ))}
                  </FlexLayout>
                </FlexLayout>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.accessor('governmentId', {
        header: 'Broj dokumenta',
        size: 220,
        enableSorting: false,
        cell: (props) => {
          const governmentId = props.getValue();

          return (
            <FlexLayout
              className="items-center gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease"
              onClick={() => copyToClipboard(governmentId)}
            >
              <Text variant="text-s">{governmentId || '–'}</Text>
              <Icon2
                className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease"
                icon="IconCopy"
              />
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Telefon',
        size: 200,
        enableSorting: false,
        cell: (props) => {
          const phoneNumber = props.getValue();
          const { messageChannel } = props.row.original;

          return (
            <FlexLayout className="flex-col gap-1">
              <FlexLayout
                className="items-center gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease"
                onClick={() => copyToClipboard(phoneNumber)}
              >
                <Text color="text-color-2" variant="text-s-medium">
                  {phoneNumber}
                </Text>
                <Icon2
                  className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease"
                  icon="IconCopy"
                />
              </FlexLayout>
              <DisplayIf condition={messageChannel === MessageChannelEnum.WHATSAPP}>
                <FlexLayout className="gap-1 items-center">
                  <Icon2 color="text-green-500" icon="IconBrandWhatsapp" size="s" type="solid" />
                  <Text color="text-color-3" variant="text-xxxs">
                    WhatsApp spojen
                  </Text>
                </FlexLayout>
              </DisplayIf>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('driverLicenceCategories', {
        header: 'Vozačke kategorije',
        size: 200,
        enableSorting: false,
        cell: (props) => {
          const licenceCategories = props.getValue();

          if (!licenceCategories || !licenceCategories.length) return '–';

          return (
            <FlexLayout className="gap-1 align-middle text-color-3">
              {licenceCategories.map((l: string) => (
                <CategoryLabel category={l} key={l} />
              ))}
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('adrExpiryDate', {
        size: 80,
        enableSorting: false,
        cell: (props) => {
          const { positions } = props.row.original;

          if (!positions.includes(PositionEnum.Driver)) return '–';

          return props.getValue() ? (
            <Icon2 className="text-green-600" icon="IconCircleCheck" size="l" />
          ) : (
            <Icon2 className="text-red-500" icon="IconX" size="l" />
          );
        },
        header: 'ADR',
      }),
    ];
  }, [groupedAlerts]);

  return <Table columns={columns} data={employees || []} />;
}
