import * as React from 'react';

import type { SearchCategoryKey } from './utils';

/** A search result opened from ⌘K or Pretraga, shown under „Nedavno” before you type (kept in this browser). */
export interface RecentSearchItem {
  category: SearchCategoryKey;
  id: string;
  href: string;
  title: string;
  subtitle?: string;
}

const KEY = 'cn:search-recent';
const MAX = 5;
const EMPTY: RecentSearchItem[] = [];

const listeners = new Set<() => void>();
let cache: { raw: string | null; items: RecentSearchItem[] } | null = null;

function read(): RecentSearchItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (cache && cache.raw === raw) return cache.items;
  let items: RecentSearchItem[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed.slice(0, MAX);
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addRecentSearchItem(item: RecentSearchItem) {
  const next = [item, ...read().filter((other) => other.href !== item.href)].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: recent items are a convenience.
  }
  listeners.forEach((listener) => listener());
}

export function useRecentSearchItems() {
  return React.useSyncExternalStore(subscribe, read, () => EMPTY);
}
