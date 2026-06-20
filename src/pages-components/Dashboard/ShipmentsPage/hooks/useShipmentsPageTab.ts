import { useRouter } from 'next/router';

export type ShipmentsPageTab = 'shipments' | 'drafts';

interface UseShipmentsPageTabResult {
  tab: ShipmentsPageTab;
  setTab: (tab: ShipmentsPageTab) => void;
}

export function useShipmentsPageTab(): UseShipmentsPageTabResult {
  const router = useRouter();
  const tab: ShipmentsPageTab = router.query.tab === 'drafts' ? 'drafts' : 'shipments';

  function setTab(next: ShipmentsPageTab) {
    if (next === tab) return;

    const query = { ...router.query };
    if (next === 'shipments') {
      delete query.tab;
    } else {
      query.tab = next;
    }

    void router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  }

  return { tab, setTab };
}
