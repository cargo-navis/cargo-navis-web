import { Button, FlexLayout } from '@/ui';

export const TenantActions = () => {
  return (
    <FlexLayout className="gap-3">
      <Button href="/dashboard/tenant/edit" iconLeft="PencilIcon" text="Uredi" variant="secondary" />
    </FlexLayout>
  );
};
