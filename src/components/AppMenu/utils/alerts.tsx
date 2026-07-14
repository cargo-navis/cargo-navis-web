import type React from 'react';
import { type ReactNode, forwardRef } from 'react';

import { type Employee, type Shipment, type Vehicle } from '@/lib/api';
import { type Alert, AlertType } from '@/lib/api';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Text } from '@/ui';
import type { AlertVariant } from '@/ui/components/Alert';
import type { IconType } from '@/ui/components/Icon/Icon';
import { MenuComponent } from '@/ui/components/Menu/types';

import { AlertMenuItem } from '../AlertMenuItem';
import { EmployeeName, VehicleRegistration } from './misc';

export function mapToAlertMenuItems(alerts: Alert[]): MenuComponent[] {
  return alerts.map((a) => ({
    type: 'custom' as const,
    Renderer: forwardRef((props, ref) => <AlertMenuItem alert={a} ref={ref} {...props} />),
    createdAt: a.createdAt,
  }));
}

// Leading icon per alert type — used by the dashboard Alert bars.
export const alertIconMap: Record<AlertType, IconType> = {
  [AlertType.SHIPMENT_INVOICE_OVERDUE]: 'IconCalendarX',
  [AlertType.TENANT_INSURANCE_EXPIRED]: 'IconShield',
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: 'IconFileText',
  [AlertType.DRIVER_LICENCE_EXPIRED]: 'IconLicense',
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: 'IconLicense',
  [AlertType.DRIVER_VISA_EXPIRED]: 'IconId',
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: 'IconStethoscope',
  [AlertType.DRIVER_ADR_EXPIRED]: 'IconFlame',
  [AlertType.DRIVER_GOV_ID_EXPIRED]: 'IconId',
  [AlertType.DRIVER_CODE_95_EXPIRED]: 'IconCertificate',
  [AlertType.DRIVER_POSTING_DECLARATION_EXPIRED]: 'IconFileText',
  [AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED]: 'IconDeviceSim',
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'IconLicense',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'IconTool',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'IconFlame',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'IconFireExtinguisher',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'IconClock',
  [AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED]: 'IconShield',
  [AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED]: 'IconShield',
  [AlertType.VEHICLE_SMALL_SERVICE_EXPIRED]: 'IconTool',
  [AlertType.VEHICLE_BIG_SERVICE_EXPIRED]: 'IconTool',
  [AlertType.VEHICLE_PERIODICAL_TECHNICAL_INSPECTION_EXPIRED]: 'IconTool',
  [AlertType.VEHICLE_TIRES_REPLACEMENT_EXPIRED]: 'IconCar',
  [AlertType.VEHICLE_LEASING_EXPIRED]: 'IconFileDescription',
  [AlertType.VEHICLE_CODE_XL_EXPIRED]: 'IconCertificate',
};

// Bold, color-inheriting emphasis for the plain (dashboard) alert copy —
// no teal/icon like the menu's EmployeeName/VehicleRegistration.
const B = ({ children }: { children: ReactNode }) => <Text variant="text-s-bold">{children}</Text>;

export function getAlertItemData(alert: Alert) {
  let targetUrl: string;
  let descriptionNode: React.ReactNode;
  let plainNode: React.ReactNode;

  const { ruleName, alertable } = alert;

  // Only overdue invoices are danger by default; everything else is a warning
  // until AlertItem promotes it to danger once its expiry date has passed.
  const variant: AlertVariant = ruleName === AlertType.SHIPMENT_INVOICE_OVERDUE ? 'danger' : 'warning';
  const icon = alertIconMap[ruleName];

  switch (ruleName) {
    case AlertType.TENANT_INSURANCE_EXPIRED: {
      targetUrl = '/dashboard/tenant';
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Kompaniji istječe generalno osiguranje.
        </Text>
      );
      plainNode = <>Kompaniji istječe generalno osiguranje</>;
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
      plainNode = (
        <>
          Zaposleniku{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe ugovor o zaposlenju
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe vozačka dozvola
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe vozačka dozvola ({employee.driverLicenceCategories?.join(', ')})
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe radna viza
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe lječnički pregled
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe ADR licenca
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe osobni dokument
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe dozvola za Kod 95
        </>
      );
      break;
    }
    case AlertType.DRIVER_POSTING_DECLARATION_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Vozaču (<EmployeeName employee={employee} />) istječe izjava o upućivanju.
        </Text>
      );
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe izjava o upućivanju
        </>
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
      plainNode = (
        <>
          Vozaču{' '}
          <B>
            {employee.firstName} {employee.lastName}
          </B>{' '}
          istječe kartica za tahograf
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe registracija
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe tehnički pregled
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe ADR
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe valjanost protupožarnog aparata
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe tahograf
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> obavezno osiguranje
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe kasko osiguranje
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe mali servis
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe veliki servis
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe periodički tehnički pregled
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe zamjena guma
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe leasing
        </>
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
      plainNode = (
        <>
          Vozilu <B>{vehicle.registration}</B> istječe dozvola Kod XL
        </>
      );
      break;
    }
    case AlertType.SHIPMENT_INVOICE_OVERDUE: {
      const shipment = alertable as Shipment;

      targetUrl = `/dashboard/shipments/${shipment.id}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          Valuta naloga <strong>({shipment.orderNumber})</strong> je istekla.
        </Text>
      );
      plainNode = (
        <>
          Valuta naloga <B>{shipment.orderNumber}</B> je istekla
        </>
      );
      break;
    }
    default: {
      // Handle non-existing case
      targetUrl = '';
      descriptionNode = null;
      plainNode = null;
      break;
    }
  }

  return { targetUrl, descriptionNode, plainNode, icon, variant };
}
