import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DriverLicenceEnum, MessageChannelEnum, PositionEnum } from '@/lib/api/employees';
import type { Employee } from '@/lib/api/employees.d';

import {
  deadlineCounts,
  deadlinesOf,
  employeeEditHref,
  employeeHref,
  expiredWord,
  fullName,
  hasWhatsApp,
  highestLicenceRank,
  isDriver,
  isOffice,
  PROFESSIONAL_LICENCES,
  soonWord,
  sortLicences,
} from './employees';

const employee = (overrides: Partial<Employee> = {}): Employee =>
  ({
    id: 'e1',
    firstName: 'Ivan',
    lastName: 'Horvat',
    positions: [PositionEnum.Driver],
    ...overrides,
  }) as Employee;

const { B, B1, C, C1, C1E, CE } = DriverLicenceEnum;

describe('people helpers', () => {
  it('builds hrefs', () => {
    expect(employeeHref('e1')).toBe('/dashboard/employees/e1');
    expect(employeeEditHref('e1')).toBe('/dashboard/employees/e1/edit');
  });

  it('joins and trims the full name', () => {
    expect(fullName({ firstName: 'Ivan', lastName: 'Horvat' })).toBe('Ivan Horvat');
    expect(fullName({ firstName: 'Ivan', lastName: '' })).toBe('Ivan');
  });

  it.each([
    [[PositionEnum.Driver], true, false],
    [[PositionEnum.Dispatcher], false, true],
    [[PositionEnum.Driver, PositionEnum.Manager], true, true],
    [[], false, false],
  ])('positions %j → driver %s, office %s', (positions, driver, office) => {
    expect(isDriver({ positions })).toBe(driver);
    expect(isOffice({ positions })).toBe(office);
  });

  it('knows WhatsApp', () => {
    expect(hasWhatsApp({ messageChannel: MessageChannelEnum.WHATSAPP })).toBe(true);
    expect(hasWhatsApp({ messageChannel: null })).toBe(false);
    expect(hasWhatsApp({})).toBe(false);
  });
});

describe('deadlinesOf', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 16, 9));
  });
  afterEach(() => vi.useRealTimers());

  it('lists every deadline for a driver, in order', () => {
    expect(deadlinesOf(employee()).map((deadline) => deadline.key)).toEqual([
      'governmentIdExpiryDate',
      'visaExpiryDate',
      'driverLicenceExpiryDate',
      'professionalDriverLicenceExpiryDate',
      'code95ExpiryDate',
      'driverTachographCardExpiryDate',
      'adrExpiryDate',
      'medicalExaminationExpiryDate',
      'postingDeclarationExpiryDate',
      'contractExpiryDate',
    ]);
  });

  it('lists only the contract for office staff', () => {
    const office = employee({ positions: [PositionEnum.Dispatcher], governmentIdExpiryDate: '2026-01-01' });
    expect(deadlinesOf(office)).toEqual([
      { key: 'contractExpiryDate', label: 'Ugovor o radu', group: 'Zaposlenje', state: 'missing' },
    ]);
  });

  it('keeps the document number where there is one', () => {
    const deadlines = deadlinesOf(
      employee({ governmentId: '123456', driverLicenceId: '', driverTachographCardId: 'HR77' })
    );
    const numberOf = (key: string) => deadlines.find((deadline) => deadline.key === key)?.number;
    expect(numberOf('governmentIdExpiryDate')).toBe('123456');
    expect(numberOf('driverLicenceExpiryDate')).toBeUndefined();
    expect(numberOf('driverTachographCardExpiryDate')).toBe('HR77');
    expect(numberOf('adrExpiryDate')).toBeUndefined();
  });

  it.each([
    [undefined, 'missing'],
    ['', 'missing'],
    ['2026-06-15', 'expired'],
    ['2026-06-16', 'soon'],
    ['2026-07-16', 'soon'],
    ['2026-07-17', 'ok'],
  ])('date %s → %s', (date, state) => {
    const [contract] = deadlinesOf(employee({ positions: [PositionEnum.Ceo], contractExpiryDate: date }));
    expect(contract.state).toBe(state);
    expect(contract.date).toBe(date || undefined);
  });

  it('counts expired and soon', () => {
    const counts = deadlineCounts(
      employee({
        governmentIdExpiryDate: '2026-06-01',
        visaExpiryDate: '2025-12-31',
        code95ExpiryDate: '2026-06-20',
        contractExpiryDate: '2028-01-01',
      })
    );
    expect(counts).toEqual({ expired: 2, soon: 1 });
  });
});

describe('Isprave words (feminine)', () => {
  it.each([
    [1, 'istekla'],
    [2, 'istekle'],
    [4, 'istekle'],
    [5, 'isteklo'],
    [11, 'isteklo'],
    [12, 'isteklo'],
    [21, 'istekla'],
    [22, 'istekle'],
  ])('%i → %s', (count, word) => expect(expiredWord(count)).toBe(word));

  it.each([
    [1, 'istječe'],
    [2, 'istječu'],
    [5, 'istječe'],
    [21, 'istječe'],
  ])('%i uskoro → %s', (count, word) => expect(soonWord(count)).toBe(word));
});

describe('licence categories', () => {
  it.each([
    [B1, false],
    [B, false],
    [C1, true],
    [C, true],
    [C1E, true],
    [CE, true],
  ])('%s professional → %s', (licence, professional) => expect(PROFESSIONAL_LICENCES.has(licence)).toBe(professional));

  it('sorts B1 → CE without changing the input', () => {
    const licences = [CE, B, C1, B1, C1E, C];
    expect(sortLicences(licences)).toEqual([B1, B, C1, C, C1E, CE]);
    expect(licences).toEqual([CE, B, C1, B1, C1E, C]);
    expect(sortLicences()).toEqual([]);
  });

  it('ranks by the highest category', () => {
    expect(highestLicenceRank(employee({ driverLicenceCategories: [B, CE, C] }))).toBe(5);
    expect(highestLicenceRank(employee({ driverLicenceCategories: [B1] }))).toBe(0);
    expect(highestLicenceRank(employee({ driverLicenceCategories: [] }))).toBe(-1);
    expect(highestLicenceRank(employee())).toBe(-1);
  });
});
