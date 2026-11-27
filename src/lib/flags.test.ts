import { afterEach, describe, expect, it, vi } from 'vitest';

import { flagDefault, isFlagOn, setFlagOverride } from './flags';

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  });
  return store;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('flags', () => {
  it('is off without env or override', () => {
    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', '');
    expect(flagDefault('nalogRouteEntry')).toBe(false);
    expect(isFlagOn('nalogRouteEntry')).toBe(false);
  });

  it('reads the env default', () => {
    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', 'true');
    expect(isFlagOn('nalogRouteEntry')).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', 'on');
    expect(isFlagOn('nalogRouteEntry')).toBe(true);
  });

  it('lets this browser override the env either way', () => {
    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', 'true');
    stubStorage({ 'ff:nalogRouteEntry': 'off' });
    expect(isFlagOn('nalogRouteEntry')).toBe(false);

    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', '');
    setFlagOverride('nalogRouteEntry', true);
    expect(isFlagOn('nalogRouteEntry')).toBe(true);

    setFlagOverride('nalogRouteEntry', null);
    expect(isFlagOn('nalogRouteEntry')).toBe(false);
  });

  it('ignores unknown override values', () => {
    vi.stubEnv('NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY', '1');
    stubStorage({ 'ff:nalogRouteEntry': 'maybe' });
    expect(isFlagOn('nalogRouteEntry')).toBe(true);
  });
});
