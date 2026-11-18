import * as React from 'react';

// Same cookie (and lifetime) the shadcn SidebarProvider writes (src/components/ui/sidebar.tsx).
const COOKIE = 'sidebar_state';
const MAX_AGE = 60 * 60 * 24 * 7;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readOpen() {
  return !document.cookie.split('; ').includes(`${COOKIE}=false`);
}

/**
 * Expanded / collapsed desktop sidebar, kept in a cookie. Every dashboard page mounts its own layout, so the state
 * lives outside React: server render and hydration use „expanded”, later mounts read the cookie straight away
 * (no flicker when moving between pages).
 */
export function useSidebarOpen(): [boolean, (open: boolean) => void] {
  const open = React.useSyncExternalStore(subscribe, readOpen, () => true);
  const setOpen = React.useCallback((next: boolean) => {
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${MAX_AGE}`;
    listeners.forEach((listener) => listener());
  }, []);
  return [open, setOpen];
}
