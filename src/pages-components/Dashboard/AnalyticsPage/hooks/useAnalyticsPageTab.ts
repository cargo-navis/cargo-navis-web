import { useRouter } from 'next/router';

export type AnalyticsPageTab = 'overview' | 'regular' | 'agency';

const TABS: AnalyticsPageTab[] = ['overview', 'regular', 'agency'];

interface UseAnalyticsPageTabResult {
  tab: AnalyticsPageTab;
  setTab: (tab: AnalyticsPageTab) => void;
  /** The page is statically optimized, so query params are only available once the router hydrates. */
  isReady: boolean;
}

export function useAnalyticsPageTab(): UseAnalyticsPageTabResult {
  const router = useRouter();
  const queryTab = router.query.tab;
  const tab = TABS.find((value) => value === queryTab) ?? 'overview';

  function setTab(next: AnalyticsPageTab) {
    if (next === tab) return;

    const query = { ...router.query };
    if (next === 'overview') {
      delete query.tab;
    } else {
      query.tab = next;
    }

    void router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  }

  return { isReady: router.isReady, setTab, tab };
}
