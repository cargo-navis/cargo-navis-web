import type { ReactNode } from 'react';

import { type Employee, type Shipment, type Vehicle } from '@/lib/api';
import { type Alert, AlertType } from '@/lib/api';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import type { AlertVariant } from '@/ui/components/Alert';
import type { IconType } from '@/ui/components/Icon/Icon';

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

// What expires, per alert type: „Zaposleniku / Vozaču X istječe …”, „Vozilu X istječe …”.
const EMPLOYEE_ALERTS: Partial<Record<AlertType, { to: string; what: (employee: Employee) => string }>> = {
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: { to: 'Zaposleniku', what: () => 'istječe ugovor o zaposlenju' },
  [AlertType.DRIVER_LICENCE_EXPIRED]: { to: 'Vozaču', what: () => 'istječe vozačka dozvola' },
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: {
    to: 'Vozaču',
    what: (employee) => `istječe vozačka dozvola (${employee.driverLicenceCategories?.join(', ') ?? ''})`,
  },
  [AlertType.DRIVER_VISA_EXPIRED]: { to: 'Vozaču', what: () => 'istječe radna viza' },
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: { to: 'Vozaču', what: () => 'istječe liječnički pregled' },
  [AlertType.DRIVER_ADR_EXPIRED]: { to: 'Vozaču', what: () => 'istječe ADR licenca' },
  [AlertType.DRIVER_GOV_ID_EXPIRED]: { to: 'Vozaču', what: () => 'istječe osobni dokument' },
  [AlertType.DRIVER_CODE_95_EXPIRED]: { to: 'Vozaču', what: () => 'istječe dozvola za Kod 95' },
  [AlertType.DRIVER_POSTING_DECLARATION_EXPIRED]: { to: 'Vozaču', what: () => 'istječe izjava o upućivanju' },
  [AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED]: { to: 'Vozaču', what: () => 'istječe kartica za tahograf' },
};

const VEHICLE_ALERTS: Partial<Record<AlertType, string>> = {
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'istječe registracija',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'istječe tehnički pregled',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'istječe ADR',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'istječe valjanost protupožarnog aparata',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'istječe tahograf',
  [AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED]: 'istječe obavezno osiguranje',
  [AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED]: 'istječe kasko osiguranje',
  [AlertType.VEHICLE_SMALL_SERVICE_EXPIRED]: 'istječe mali servis',
  [AlertType.VEHICLE_BIG_SERVICE_EXPIRED]: 'istječe veliki servis',
  [AlertType.VEHICLE_PERIODICAL_TECHNICAL_INSPECTION_EXPIRED]: 'istječe periodički tehnički pregled',
  [AlertType.VEHICLE_TIRES_REPLACEMENT_EXPIRED]: 'istječe zamjena guma',
  [AlertType.VEHICLE_LEASING_EXPIRED]: 'istječe leasing',
  [AlertType.VEHICLE_CODE_XL_EXPIRED]: 'istječe dozvola Kod XL',
};

// Bold, colour- and size-inheriting emphasis for the alert copy.
const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold">{children}</strong>;

/**
 * Link target, one-line copy, icon and default tone of an alert. Used by the bell in the top bar and by the alert bars
 * on Početna.
 */
export function getAlertItemData(alert: Alert) {
  const { ruleName, alertable } = alert;

  // Only overdue invoices are danger by default; everything else is a warning
  // until AlertItem promotes it to danger once its expiry date has passed.
  const variant: AlertVariant = ruleName === AlertType.SHIPMENT_INVOICE_OVERDUE ? 'danger' : 'warning';
  const icon = alertIconMap[ruleName];

  let targetUrl = '';
  let plainNode: ReactNode = null;

  const employeeAlert = EMPLOYEE_ALERTS[ruleName];
  const vehicleAlert = VEHICLE_ALERTS[ruleName];

  if (ruleName === AlertType.TENANT_INSURANCE_EXPIRED) {
    targetUrl = '/dashboard/settings/company';
    plainNode = <>Kompaniji istječe generalno osiguranje</>;
  } else if (ruleName === AlertType.SHIPMENT_INVOICE_OVERDUE) {
    const shipment = alertable as Shipment;
    targetUrl = `/dashboard/shipments/${shipment.id}`;
    plainNode = (
      <>
        Valuta naloga <B>{shipment.orderNumber}</B> je istekla
      </>
    );
  } else if (employeeAlert) {
    const employee = alertable as Employee;
    targetUrl = `/dashboard/employees/${employee.id}`;
    plainNode = (
      <>
        {employeeAlert.to}{' '}
        <B>
          {employee.firstName} {employee.lastName}
        </B>{' '}
        {employeeAlert.what(employee)}
      </>
    );
  } else if (vehicleAlert) {
    const vehicle = alertable as Vehicle;
    targetUrl = `/dashboard/fleet/${vehicleTypeToPathMap[vehicle.type]}/${vehicle.id}`;
    plainNode = (
      <>
        Vozilu <B>{vehicle.registration}</B> {vehicleAlert}
      </>
    );
  }

  return { targetUrl, plainNode, icon, variant };
}
