import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addRecentSearchItem, type RecentSearchItem } from './recent';

const KEY = 'cn:search-recent';

let store: Map<string, string>;
let storage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };

beforeEach(() => {
  store = new Map();
  storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
  };
  Object.assign(globalThis, { window: { localStorage: storage } });
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

const item = (id: string, overrides: Partial<RecentSearchItem> = {}): RecentSearchItem => ({
  category: 'shipments',
  id,
  href: `/dashboard/shipments/${id}`,
  title: `Nalog ${id}`,
  ...overrides,
});

const stored = () => JSON.parse(store.get(KEY) ?? 'null') as RecentSearchItem[] | null;
const storedIds = () => stored()?.map((recent) => recent.id);

describe('addRecentSearchItem', () => {
  it('saves the first item', () => {
    addRecentSearchItem(item('1', { subtitle: 'Bomark' }));
    expect(stored()).toEqual([item('1', { subtitle: 'Bomark' })]);
  });

  it('puts the newest first', () => {
    addRecentSearchItem(item('1'));
    addRecentSearchItem(item('2'));
    expect(storedIds()).toEqual(['2', '1']);
  });

  it('moves a reopened item to the top with its new data', () => {
    addRecentSearchItem(item('1'));
    addRecentSearchItem(item('2'));
    addRecentSearchItem(item('1', { title: 'Nalog 1 (novo)' }));
    expect(stored()).toEqual([item('1', { title: 'Nalog 1 (novo)' }), item('2')]);
  });

  it('dedupes by href, not id', () => {
    addRecentSearchItem(item('1'));
    addRecentSearchItem(item('1', { category: 'fleet', href: '/dashboard/fleet/1' }));
    expect(stored()?.map((recent) => recent.href)).toEqual(['/dashboard/fleet/1', '/dashboard/shipments/1']);
  });

  it('keeps the last 5', () => {
    for (const id of ['1', '2', '3', '4', '5', '6']) addRecentSearchItem(item(id));
    expect(storedIds()).toEqual(['6', '5', '4', '3', '2']);
  });

  it('trims a longer stored list', () => {
    store.set(KEY, JSON.stringify(['1', '2', '3', '4', '5', '6', '7'].map((id) => item(id))));
    addRecentSearchItem(item('8'));
    expect(storedIds()).toEqual(['8', '1', '2', '3', '4']);
  });

  it.each([
    ['broken JSON', '{not json'],
    ['an object', '{"a":1}'],
    ['null', 'null'],
  ])('starts over when storage holds %s', (_, raw) => {
    store.set(KEY, raw);
    addRecentSearchItem(item('1'));
    expect(storedIds()).toEqual(['1']);
  });

  it('starts over when storage cannot be read', () => {
    store.set(KEY, JSON.stringify([item('1')]));
    storage.getItem = () => {
      throw new Error('SecurityError');
    };
    addRecentSearchItem(item('2'));
    expect(storedIds()).toEqual(['2']);
  });

  it('does not throw when storage is full', () => {
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => addRecentSearchItem(item('1'))).not.toThrow();
  });
});
