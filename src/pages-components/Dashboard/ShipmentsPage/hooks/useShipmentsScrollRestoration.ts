import { useCallback, useEffect, useRef } from 'react';

const SCROLL_KEY = 'shipments-scroll-y';

export function useShipmentsScrollRestoration({ isReady }: { isReady: boolean }) {
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!isReady || restoredRef.current) return;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (!saved) return;

    const scrollY = parseInt(saved, 10);
    if (isNaN(scrollY)) return;

    restoredRef.current = true;
    sessionStorage.removeItem(SCROLL_KEY);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, [isReady]);

  const saveScrollPosition = useCallback(() => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }, []);

  return { saveScrollPosition };
}
