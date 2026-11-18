import { DriverLicenceEnum, MessageChannelEnum, PositionEnum } from '@/lib/api/employees';
import type { Employee } from '@/lib/api/employees.d';
import { type ExpiryState, getExpiryState } from '@/lib/utils/date';
import { plural } from '@/lib/utils/plural';

/** Lab /employees labels (Direktor, Menadžer, Disponent, Vozač), in the lab's order. */
export const POSITION_LABEL: Record<PositionEnum, string> = {
  [PositionEnum.Driver]: 'Vozač',
  [PositionEnum.Dispatcher]: 'Disponent',
  [PositionEnum.Manager]: 'Menadžer',
  [PositionEnum.Ceo]: 'Direktor',
};
export const POSITION_ORDER: PositionEnum[] = [
  PositionEnum.Driver,
  PositionEnum.Dispatcher,
  PositionEnum.Manager,
  PositionEnum.Ceo,
];

export const employeeHref = (id: string) => `/dashboard/employees/${id}`;
export const employeeEditHref = (id: string) => `/dashboard/employees/${id}/edit`;

export const fullName = (employee: Pick<Employee, 'firstName' | 'lastName'>) =>
  `${employee.firstName} ${employee.lastName}`.trim();
export const isDriver = (employee: Pick<Employee, 'positions'>) => employee.positions.includes(PositionEnum.Driver);
export const isOffice = (employee: Pick<Employee, 'positions'>) =>
  employee.positions.some((position) => position !== PositionEnum.Driver);
export const hasWhatsApp = (employee: Pick<Employee, 'messageChannel'>) =>
  employee.messageChannel === MessageChannelEnum.WHATSAPP;

// ---------------------------------------------------------------------------------------------------------------------
// Isprave i rokovi
// ---------------------------------------------------------------------------------------------------------------------

type DateKey = {
  [K in keyof Employee]-?: K extends `${string}ExpiryDate` ? K : never;
}[keyof Employee];

/** Every deadline of one employee, in a fixed order, with who it applies to (lab /employees data.ts `DEADLINES`). */
export const DEADLINES: {
  key: DateKey;
  label: string;
  number?: 'governmentId' | 'driverLicenceId' | 'driverTachographCardId';
  group: string;
  driverOnly?: boolean;
}[] = [
  {
    key: 'governmentIdExpiryDate',
    label: 'Osobna iskaznica / putovnica',
    number: 'governmentId',
    group: 'Identitet',
    driverOnly: true,
  },
  { key: 'visaExpiryDate', label: 'Radna dozvola / viza', group: 'Identitet', driverOnly: true },
  {
    key: 'driverLicenceExpiryDate',
    label: 'Vozačka dozvola',
    number: 'driverLicenceId',
    group: 'Vozačka',
    driverOnly: true,
  },
  { key: 'professionalDriverLicenceExpiryDate', label: 'Profesionalna vozačka', group: 'Vozačka', driverOnly: true },
  { key: 'code95ExpiryDate', label: 'Kod 95', group: 'Vozačka', driverOnly: true },
  {
    key: 'driverTachographCardExpiryDate',
    label: 'Tahografska kartica',
    number: 'driverTachographCardId',
    group: 'Vozačka',
    driverOnly: true,
  },
  { key: 'adrExpiryDate', label: 'ADR', group: 'Kvalifikacije', driverOnly: true },
  { key: 'medicalExaminationExpiryDate', label: 'Liječnički pregled', group: 'Kvalifikacije', driverOnly: true },
  { key: 'postingDeclarationExpiryDate', label: 'Izjava o upućivanju', group: 'Zaposlenje', driverOnly: true },
  { key: 'contractExpiryDate', label: 'Ugovor o radu', group: 'Zaposlenje' },
];

export interface Deadline {
  key: DateKey;
  label: string;
  group: string;
  date?: string;
  number?: string;
  state: ExpiryState;
}

export function deadlinesOf(employee: Employee): Deadline[] {
  const driver = isDriver(employee);
  return DEADLINES.filter((deadline) => driver || !deadline.driverOnly).map((deadline) => {
    const date = employee[deadline.key] || undefined;
    return {
      key: deadline.key,
      label: deadline.label,
      group: deadline.group,
      date,
      number: deadline.number ? employee[deadline.number] || undefined : undefined,
      state: getExpiryState(date),
    };
  });
}

export function deadlineCounts(employee: Employee) {
  const states = deadlinesOf(employee).map((deadline) => deadline.state);
  return {
    expired: states.filter((state) => state === 'expired').length,
    soon: states.filter((state) => state === 'soon').length,
  };
}

/** „Isprave” is feminine: 1 istekla, 2–4 istekle, 5+ isteklo; istječe / istječu. */
export const expiredWord = (count: number) => plural(count, ['istekla', 'istekle', 'isteklo']);
export const soonWord = (count: number) => plural(count, ['istječe', 'istječu', 'istječe']);

// ---------------------------------------------------------------------------------------------------------------------
// Kategorije
// ---------------------------------------------------------------------------------------------------------------------

export const LICENCES: DriverLicenceEnum[] = [
  DriverLicenceEnum.B1,
  DriverLicenceEnum.B,
  DriverLicenceEnum.C1,
  DriverLicenceEnum.C,
  DriverLicenceEnum.C1E,
  DriverLicenceEnum.CE,
];

export const LICENCE_RANK: Record<DriverLicenceEnum, number> = {
  [DriverLicenceEnum.B1]: 0,
  [DriverLicenceEnum.B]: 1,
  [DriverLicenceEnum.C1]: 2,
  [DriverLicenceEnum.C]: 3,
  [DriverLicenceEnum.C1E]: 4,
  [DriverLicenceEnum.CE]: 5,
};

export const sortLicences = (licences: DriverLicenceEnum[] = []) =>
  [...licences].sort((a, b) => (LICENCE_RANK[a] ?? -1) - (LICENCE_RANK[b] ?? -1));

export const highestLicenceRank = (employee: Employee) =>
  Math.max(-1, ...(employee.driverLicenceCategories ?? []).map((licence) => LICENCE_RANK[licence] ?? -1));
