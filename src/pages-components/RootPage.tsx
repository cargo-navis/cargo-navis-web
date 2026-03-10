import type { NextPage } from 'next';

import { LoadingPage } from '@/lib/components/LoadingPage';
import { FlexLayout } from '@/ui';

export const RootPage: NextPage = () => {
  return (
    <FlexLayout className="w-full h-screen">
      <LoadingPage />
    </FlexLayout>
  );
};
