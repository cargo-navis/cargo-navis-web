import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

export function useScrollRestoration(key: string, { isReady }: { isReady: boolean }) {
  const storageKey = `scroll-y:${key}`;
  const restoredRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, storageKey]);

  useEffect(() => {
    if (!isReady || restoredRef.current) return;

    const saved = sessionStorage.getItem(storageKey);
    if (!saved) return;

    const scrollY = parseInt(saved, 10);
    if (isNaN(scrollY)) return;

    restoredRef.current = true;
    sessionStorage.removeItem(storageKey);

    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, [isReady, storageKey]);
}
