import * as React from 'react';

/**
 * Feature flags (KAN-55, DECISIONS §7): a parked alternative can ship dark and be switched on without a deploy.
 *
 * Default = the `NEXT_PUBLIC_FF_<NAME>` env var (`true` / `1` / `on`); one browser can override it in the console:
 * `localStorage.setItem('ff:nalogRouteEntry', 'on')` (or `'off'`; remove the key to go back to the default).
 *
 * In render use `useFlag(name)` (env value on the server and the first client render, the override after mount, so
 * static pages hydrate cleanly); in event handlers `isFlagOn(name)` is fine.
 */

// Each env var is spelled out literally: Next inlines `process.env.NEXT_PUBLIC_*` only in that form.
function envValue(name: FlagName): string | undefined {
  switch (name) {
    case 'nalogRouteEntry':
      return process.env.NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY;
  }
}

const FLAG_NAMES = [
  /** Nalog form: „Ruta pa tereti” (route-first entry, parked; lab /nalog-form). Off. */
  'nalogRouteEntry',
] as const;

export type FlagName = (typeof FLAG_NAMES)[number];

const STORAGE_PREFIX = 'ff:';

function parse(value: string | null | undefined): boolean | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'on') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'off') return false;
  return undefined;
}

/** The env default, the same on the server and in the browser. */
export function flagDefault(name: FlagName): boolean {
  return parse(envValue(name)) ?? false;
}

function localOverride(name: FlagName): boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return parse(window.localStorage.getItem(STORAGE_PREFIX + name));
  } catch {
    return undefined; // storage blocked (private mode, sandboxed iframe)
  }
}

/** The flag with this browser's override applied. Not for render (see `useFlag`). */
export function isFlagOn(name: FlagName): boolean {
  return localOverride(name) ?? flagDefault(name);
}

/** Sets (true / false) or clears (null) this browser's override. */
export function setFlagOverride(name: FlagName, value: boolean | null) {
  if (typeof window === 'undefined') return;
  if (value === null) window.localStorage.removeItem(STORAGE_PREFIX + name);
  else window.localStorage.setItem(STORAGE_PREFIX + name, value ? 'on' : 'off');
}

/** SSR-safe: the env default first, this browser's override after mount. */
export function useFlag(name: FlagName): boolean {
  const [on, setOn] = React.useState(() => flagDefault(name));
  React.useEffect(() => {
    setOn(isFlagOn(name));
  }, [name]);
  return on;
}

export const FLAGS: readonly FlagName[] = FLAG_NAMES;
