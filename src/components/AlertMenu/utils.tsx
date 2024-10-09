import type { Employee, Vehicle } from '@/lib/api';
import { type Alert, AlertType } from '@/lib/mocks/alerts';
import { FlexLayout, Icon, Text } from '@/ui';

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
          Zaposleniku (<EmployeeName employee={employee} />) uskoro istječe ugovor o zaposlenju.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) uskoro istječe vozačka dozvola.
        </Text>
      );
      break;
    }
    case AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED: {
      const employee = alertable as Employee;
      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) uskoro istječe vozačka dozvola (
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
          Vozaču (<EmployeeName employee={employee} />) uskoro istječe radna viza.
        </Text>
      );
      break;
    }
    case AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED: {
      const employee = alertable as Employee;

      targetUrl = `/dashboard/employees/${employee.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozaču (<EmployeeName employee={employee} />) uskoro istječe lječnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_REGISTRATION_EXPIRED: {
      const vehicle = alertable as Vehicle;

      // TODO - fix: trucks|trailers|solos|vans
      targetUrl = `/dashboard/fleet/trucks/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<Text variant="text-s-bold">{vehicle.registration}</Text>) uskoro istječe registracija.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED: {
      const vehicle = alertable as Vehicle;

      // TODO - fix: trucks|trailers|solos|vans
      targetUrl = `/dashboard/fleet/trucks/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<Text variant="text-s-bold">{vehicle.registration}</Text>) uskoro istječe tehnički pregled.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_ADR_EXPIRED: {
      const vehicle = alertable as Vehicle;

      // TODO - fix: trucks|trailers|solos|vans
      targetUrl = `/dashboard/fleet/trucks/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<Text variant="text-s-bold">{vehicle.registration}</Text>) uskoro istječe ADR.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED: {
      const vehicle = alertable as Vehicle;

      // TODO - fix: trucks|trailers|solos|vans
      targetUrl = `/dashboard/fleet/trucks/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<Text variant="text-s-bold">{vehicle.registration}</Text>) uskoro istječe valjanost protupožarnog
          aparata.
        </Text>
      );
      break;
    }
    case AlertType.VEHICLE_TACHOGRAPH_EXPIRED: {
      const vehicle = alertable as Vehicle;

      // TODO - fix: trucks|trailers|solos|vans
      targetUrl = `/dashboard/fleet/trucks/${vehicle.id}`;
      descriptionNode = (
        <Text variant="text-s" color="text-color-2">
          Vozilu (<Text variant="text-s-bold">{vehicle.registration}</Text>) istječe tahograf.
        </Text>
      );
      break;
    }
    default: {
      // Handle non-existing case
      targetUrl = '';
      break;
    }
  }

  return { targetUrl, descriptionNode };
}

function EmployeeName({ employee }: { employee: Employee }) {
  return (
    <FlexLayout className="inline-flex items-center gap-1 align-bottom">
      <Icon icon="UserIcon" />
      <Text variant="text-s-bold">
        {employee.firstName} {employee.lastName}
      </Text>
    </FlexLayout>
  );
}
