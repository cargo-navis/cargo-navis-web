import { AlertType } from '@/lib/api/alerts';
import type { Alert } from '@/lib/api/alerts.d';
import type { Shipment } from '@/lib/api/shipments.d';
import { daysFromToday } from '@/lib/utils/date';
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';

import { ruleToPropertyMap, ruleToTextMap } from './components/utils';

export type WarningKind = 'invoice' | 'document' | 'vehicle' | 'company';

/** One row of „Treba pažnju”: an alert as „what · whose” + how late / how soon. */
export interface Warning {
  id: string;
  kind: WarningKind;
  severity: 'expired' | 'soon';
  title: string;
  detail: string;
  /** Days from today to the expiry / due date (negative = past); undefined when the date is unknown. */
  days?: number;
}

type Gender = 'm' | 'f' | 'n';

/** Croatian agreement for „Istekao / Istekla / Isteklo prije N d” (DECISIONS §1 Words). */
const GENDER: Record<AlertType, Gender> = {
  [AlertType.TENANT_INSURANCE_EXPIRED]: 'n',
  [AlertType.EMPLOYEE_CONTRACT_EXPIRED]: 'm',
  [AlertType.DRIVER_LICENCE_EXPIRED]: 'f',
  [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED]: 'f',
  [AlertType.DRIVER_VISA_EXPIRED]: 'f',
  [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED]: 'm',
  [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'f',
  [AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED]: 'm',
  [AlertType.VEHICLE_ADR_EXPIRED]: 'm',
  [AlertType.VEHICLE_FIRE_EXTINGUISHER_CHECK_EXPIRED]: 'f',
  [AlertType.VEHICLE_TACHOGRAPH_EXPIRED]: 'm',
  [AlertType.DRIVER_ADR_EXPIRED]: 'm',
  [AlertType.DRIVER_GOV_ID_EXPIRED]: 'm',
  [AlertType.DRIVER_CODE_95_EXPIRED]: 'm',
  [AlertType.DRIVER_POSTING_DECLARATION_EXPIRED]: 'f',
  [AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED]: 'f',
  [AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED]: 'n',
  [AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED]: 'n',
  [AlertType.VEHICLE_SMALL_SERVICE_EXPIRED]: 'm',
  [AlertType.VEHICLE_BIG_SERVICE_EXPIRED]: 'm',
  [AlertType.VEHICLE_PERIODICAL_TECHNICAL_INSPECTION_EXPIRED]: 'm',
  [AlertType.VEHICLE_TIRES_REPLACEMENT_EXPIRED]: 'f',
  [AlertType.VEHICLE_LEASING_EXPIRED]: 'm',
  [AlertType.VEHICLE_CODE_XL_EXPIRED]: 'm',
  [AlertType.SHIPMENT_INVOICE_OVERDUE]: 'f',
};

/** Next to the registration the shared label's „vozila” is redundant (lab: „KC 456-CD · Registracija”). */
const TITLE_TEXT: Partial<Record<AlertType, string>> = { [AlertType.VEHICLE_REGISTRATION_EXPIRED]: 'Registracija' };

const EXPIRED: Record<Gender, string> = { m: 'Istekao', f: 'Istekla', n: 'Isteklo' };

const eur = (value: number) =>
  new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

function kindOf(rule: AlertType): WarningKind {
  if (rule === AlertType.SHIPMENT_INVOICE_OVERDUE) return 'invoice';
  if (rule === AlertType.TENANT_INSURANCE_EXPIRED) return 'company';
  return rule.startsWith('VEH_') ? 'vehicle' : 'document';
}

interface Lookups {
  clientsById: Map<string, { name: string; termsOfPayment?: string | number }>;
  now?: Date;
}

/** The expiry (or, for invoices, the due) date of an alert. */
export function getAlertDate(alert: Alert, { clientsById }: Pick<Lookups, 'clientsById'>): string | Date | null {
  if (alert.ruleName === AlertType.SHIPMENT_INVOICE_OVERDUE) {
    const shipment = alert.alertable as Shipment;
    const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
    return getShipmentOverdueInfo({
      invoiceStatus: shipment.invoiceStatus,
      invoiceStatusUpdatedAt: shipment.invoiceStatusUpdatedAt,
      termsOfPayment: client?.termsOfPayment,
    }).dueDate;
  }
  return alert.alertable?.[ruleToPropertyMap[alert.ruleName]] ?? null;
}

export function buildWarning(alert: Alert, { clientsById, now = new Date() }: Lookups): Warning {
  const rule = alert.ruleName;
  const kind = kindOf(rule);
  const date = getAlertDate(alert, { clientsById });
  const days = date ? daysFromToday(date, now) : undefined;
  // Overdue invoices are past by definition; the rest are expired once the date has passed.
  const severity = kind === 'invoice' || days === undefined || days < 0 ? 'expired' : 'soon';

  let title: string;
  let detail: string;
  if (kind === 'invoice') {
    const shipment = alert.alertable as Shipment;
    const client = shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined;
    title = [`Faktura ${shipment.orderNumber}`, client].filter(Boolean).join(' · ');
    const due = days === undefined ? 'Dospjela' : days < 0 ? `Dospjela prije ${-days} d` : 'Dospjela danas';
    detail = shipment.price ? `${due} · ${eur(shipment.price)}` : due;
  } else {
    const subject =
      kind === 'company'
        ? undefined
        : kind === 'vehicle'
          ? alert.alertable?.registration
          : [alert.alertable?.firstName, alert.alertable?.lastName].filter(Boolean).join(' ');
    title =
      kind === 'company'
        ? 'Osiguranje tereta'
        : [subject, TITLE_TEXT[rule] ?? ruleToTextMap[rule]].filter(Boolean).join(' · ');
    detail =
      days === undefined
        ? EXPIRED[GENDER[rule]]
        : days < 0
          ? `${EXPIRED[GENDER[rule]]} prije ${-days} d`
          : days === 0
            ? 'Istječe danas'
            : `Istječe za ${days} d`;
  }

  return { id: alert.id, kind, severity, title, detail, days };
}

/** Expired first (the longest ago first), then what expires soon (the soonest first). */
export function sortWarnings<T extends Pick<Warning, 'severity' | 'days'>>(warnings: T[]): T[] {
  const rank = (warning: T) => (warning.severity === 'expired' ? 0 : 1);
  return [...warnings].sort((a, b) => rank(a) - rank(b) || (a.days ?? -Infinity) - (b.days ?? -Infinity));
}
