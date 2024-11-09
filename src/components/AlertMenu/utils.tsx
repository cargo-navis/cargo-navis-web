import { type Employee, type Vehicle, VehicleEnum } from '@/lib/api';
import { type Alert, AlertType } from '@/lib/api';
import { FlexLayout, Icon, Text } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';
import type React from 'react';
import { forwardRef } from 'react';

import { AlertMenuItem } from './AlertMenuItem';

export function mapToMenuItems(alerts: Alert[]): MenuComponent[] {
  return alerts.map((a) => ({
    type: 'custom',
    Renderer: forwardRef((props, ref) => <AlertMenuItem alert={a} ref={ref} {...props} />),
  }));
}

export function getItemData(alert: Alert) {
  let targetUrl: string;
  let descriptionNode: React.ReactNode;

  const { ruleName, alertable } = alert;

  switch (ruleName) {
    case AlertType.EMPLOYEE_CONTRACT_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Zaposleniku (<EmployeeName employee={employee} />) istječe ugovor o zaposlenju.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) istječe vozačka dozvola.
        </Text>
      );
      break;
    }
    case AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;
      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) istječe vozačka dozvola (
          {employee.driverLicenceCategories?.join(', ')}).
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_VISA_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) istječe radna viza.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) istječe lječnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_REGISTRATION_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe registracija.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe tehnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_ADR_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe ADR.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe valjanost protupožarnog aparata.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_TACHOGRAPH_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe tahograf.
        </Text>
      );
      break;
    }
    default: {
      // Handle non-existing case
      targetUrl = '';
      descriptionNode = null;
      break;
    }
  }

  return { targetUrl, descriptionNode };
}

function EmployeeName({ employee }: { employee: Employee }) {
  return (
    <FlexLayout className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 align-bottom">
      <Icon icon="UserIcon" />
      <Text variant="text-s-bold">
        {employee.firstName} {employee.lastName}
      </Text>
    </FlexLayout>
  );
}

function VehicleRegistration({ vehicle }: { vehicle: Vehicle }) {
  return (
    <FlexLayout className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 align-bottom">
      <Icon icon="TruckIcon" />
      <Text variant="text-s-bold">{vehicle.registration}</Text>
    </FlexLayout>
  );
}

export const vehicleTypeToPathMap = {
  [VehicleEnum.TRUCK]: 'trucks',
  [VehicleEnum.TRAILER]: 'trailers',
  [VehicleEnum.SOLO_TRUCK]: 'solo-trucks',
  [VehicleEnum.VAN]: 'vans',
};
