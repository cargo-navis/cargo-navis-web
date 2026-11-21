import * as React from 'react';

/**
 * `flag`, but only once it has been true for `delay` ms (KAN-55, /overlays/loading: loading UI waits 300ms so fast
 * answers never flash a skeleton, dim or bar). Goes false at once.
 */
export function useDelayedFlag(flag: boolean, delay = 300) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!flag) return;
    const timeout = window.setTimeout(() => setShown(true), delay);
    return () => {
      window.clearTimeout(timeout);
      setShown(false);
    };
  }, [flag, delay]);
  return flag && shown;
}
