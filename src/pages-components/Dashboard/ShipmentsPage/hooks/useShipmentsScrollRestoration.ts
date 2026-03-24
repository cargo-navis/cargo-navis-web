import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

const SCROLL_KEY = 'shipments-scroll-y';

export function useShipmentsScrollRestoration({ isReady }: { isReady: boolean }) {
  const restoredRef = useRef(false);
  const router = useRouter();

  // Save scroll position on any navigation away from this page
  useEffect(() => {
    const handleRouteChange = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Restore scroll position once data is ready
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
}
