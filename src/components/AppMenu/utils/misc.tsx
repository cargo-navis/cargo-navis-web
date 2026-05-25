import Link from 'next/link';
import { forwardRef } from 'react';

import { type Employee, LoadStatus, type Vehicle } from '@/lib/api';
import { useEmployee } from '@/lib/hooks';
import { loadStatusConfig } from '@/pages-components/Dashboard/ShipmentsPage/const';
import { Box, FlexLayout, Icon, LoadingSpinner, Pill, Text } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

export function ShipmentStatusPill({ status }: { status: LoadStatus }) {
  const statusConfig = loadStatusConfig[status];

  return (
    <Box className="inline-flex">
      <Pill size="s" text={statusConfig.label} variant={statusConfig.variant} />
    </Box>
  );
}

export function EmployeeNameById({ id }: { id: string }) {
  const { data: employee } = useEmployee(id);

  if (!employee) return null;
  return <EmployeeName employee={employee} />;
}

export function EmployeeName({ employee }: { employee: Employee }) {
  return (
    <FlexLayout className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 align-bottom">
      <Icon icon="IconUser" />
      <Text variant="text-s-bold">
        {employee.firstName} {employee.lastName}
      </Text>
    </FlexLayout>
  );
}

export function VehicleRegistration({ vehicle }: { vehicle: Vehicle }) {
  return (
    <FlexLayout className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 align-bottom">
      <Icon icon="IconTruck" />
      <Text variant="text-s-bold">{vehicle.registration}</Text>
    </FlexLayout>
  );
}

export const emptyMenuItem: MenuComponent = {
  type: 'custom',
  Renderer: () => (
    <FlexLayout className="justify-center items-center p-3">
      <Text color="text-color-2" variant="text-s">
        Nema novih Upozorenja
      </Text>
    </FlexLayout>
  ),
};

export const loadingItem: MenuComponent = {
  type: 'custom',
  Renderer: () => (
    <FlexLayout className="justify-center items-center px-3 py-7">
      <LoadingSpinner />
    </FlexLayout>
  ),
};

const SeeMoreItem = forwardRef((props, ref) => (
  <Link href="/dashboard">
    <FlexLayout
      className={`
        justify-center items-center gap-2 py-3 
        hover:bg-dark-50 hover:dark:bg-light-800 data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800 
        outline-0
      `}
      ref={ref}
      {...props}
    >
      <Text color="text-color-2" variant="text-s">
        Vidi više
      </Text>
      <Icon icon="IconArrowRight" />
    </FlexLayout>
  </Link>
));

SeeMoreItem.displayName = 'SeeMoreItem';

export const seeMoreItem: MenuComponent = {
  type: 'custom',
  Renderer: SeeMoreItem,
};
