import type { NextPage } from 'next';

import { LoadingPage } from '@/lib/components/LoadingPage';

/** `/` redirects to /dashboard in middleware.ts; this loading screen is only the fallback. */
export const RootPage: NextPage = () => {
  return <LoadingPage />;
};
