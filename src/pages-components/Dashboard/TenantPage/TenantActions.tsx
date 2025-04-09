import Link from 'next/link';

import { Button, FlexLayout } from '@/ui';

export const TenantActions = () => {
  return (
    <FlexLayout className="gap-3">
      <Link href="/dashboard/tenant/edit">
        <Button iconLeft="PencilIcon" text="Uredi" variant="secondary" />
      </Link>
    </FlexLayout>
  );
};
