import { describe, expect, it } from 'vitest';

import { dayLabel, groupByDay, groupWarnings, notificationsHref, tabFromQuery } from './notifications';

const NOW = new Date(2026, 10, 19, 9, 30); // četvrtak 19.11.2026. 09:30

const at = (id: string, date: Date) => ({ id, createdAt: date.toISOString() });

describe('groupByDay', () => {
  it('sorts newest first and groups by calendar day', () => {
    const items = [
      at('a', new Date(2026, 10, 17, 15, 31)),
      at('b', new Date(2026, 10, 19, 8, 0)),
      at('c', new Date(2026, 10, 18, 17, 2)),
      at('d', new Date(2026, 10, 19, 9, 10)),
      at('e', new Date(2026, 10, 18, 0, 5)),
      at('f', new Date(2025, 11, 31, 23, 0)),
    ];
    const groups = groupByDay(items, NOW);
    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      ['Danas', ['d', 'b']],
      ['Jučer', ['c', 'e']],
      ['17.11.', ['a']],
      ['31.12.2025.', ['f']],
    ]);
    expect(groups[0].key).toBe('2026-11-19');
  });

  it('returns no groups for no items', () => {
    expect(groupByDay([], NOW)).toEqual([]);
  });
});

describe('dayLabel', () => {
  it('says Danas / Jučer, else the short date (full date in other years)', () => {
    expect(dayLabel(new Date(2026, 10, 19, 0, 1), NOW)).toBe('Danas');
    expect(dayLabel(new Date(2026, 10, 18, 23, 59), NOW)).toBe('Jučer');
    expect(dayLabel(new Date(2026, 10, 7, 12), NOW)).toBe('7.11.');
    expect(dayLabel(new Date(2025, 10, 7, 12), NOW)).toBe('7.11.2025.');
  });
});

describe('groupWarnings', () => {
  it('splits by kind and keeps the incoming (urgency) order', () => {
    const groups = groupWarnings([
      { id: '1', kind: 'invoice' as const },
      { id: '2', kind: 'vehicle' as const },
      { id: '3', kind: 'invoice' as const },
      { id: '4', kind: 'company' as const },
    ]);
    expect(groups.invoice.map((warning) => warning.id)).toEqual(['1', '3']);
    expect(groups.vehicle.map((warning) => warning.id)).toEqual(['2']);
    expect(groups.document).toEqual([]);
    expect(groups.company.map((warning) => warning.id)).toEqual(['4']);
  });
});

describe('tabs', () => {
  it('reads ?tab= with „Treba pažnju” as the default', () => {
    expect(tabFromQuery('aktivnost')).toBe('aktivnost');
    expect(tabFromQuery('paznja')).toBe('paznja');
    expect(tabFromQuery(undefined)).toBe('paznja');
    expect(tabFromQuery(['aktivnost'])).toBe('paznja');
    expect(notificationsHref('aktivnost')).toBe('/dashboard/notifications?tab=aktivnost');
  });
});
