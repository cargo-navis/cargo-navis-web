import type React from 'react';
import { forwardRef } from 'react';

import { type Employee, type Vehicle } from '@/lib/api';
import { type Alert, AlertType } from '@/lib/api';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Text } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

import { AlertMenuItem } from '../AlertMenuItem';
import { EmployeeName, VehicleRegistration } from './misc';

export function mapToAlertMenuItems(alerts: Alert[]): MenuComponent[] {
  return alerts.map((a) => ({
    type: 'custom' as const,
    Renderer: forwardRef((props, ref) => <AlertMenuItem alert={a} ref={ref} {...props} />),
  }));
}

export function getAlertItemData(alert: Alert) {
  let targetUrl: string;
  let descriptionNode: React.ReactNode;

  const { ruleName, alertable } = alert;

  switch (ruleName) {
    case AlertType.TENANT_INSURANCE_EXPIRED: {
      targetUrl = '/dashboard/tenant';
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Kompaniji istječe generalno osiguranje.
        </Text>
      );
      break;
    }
    case AlertType.EMPLOYEE_CONTRACT_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Zaposleniku (<EmployeeName employee={employee} />) istječe ugovor o zaposlenju.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe vozačka dozvola.
        </Text>
      );
      break;
    }
    case AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;
      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
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
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe radna viza.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe lječnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_ADR_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe ADR licenca.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_GOV_ID_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe osobni dokument.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_CODE_95_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe dozvola za Kod 95.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe kartica za tahograf.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_REGISTRATION_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
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
        <Text color="text-color-2" variant="text-s">
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
        <Text color="text-color-2" variant="text-s">
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
        <Text color="text-color-2" variant="text-s">
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
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe tahograf.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) obavezno osiguranje.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe kasko osiguranje.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_SMALL_SERVICE_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe mali servis.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_BIG_SERVICE_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe veliki servis.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_PERIODICAL_TECHNICAL_INSPECTION_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe periodički tehnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_TIRES_REPLACEMENT_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe zamjena guma.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_LEASING_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe leasing.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_CODE_XL_EXPIRED: {
      const vehicle = alertable as Vehicle;
      const path = vehicleTypeToPathMap[vehicle.type];

      targetUrl = `/dashboard/fleet/${path}/${vehicle.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozilu (<VehicleRegistration vehicle={vehicle} />) istječe dozvola Kod XL.
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
