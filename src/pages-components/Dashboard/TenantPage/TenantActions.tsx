import { Button, FlexLayout } from '@/ui';

export const TenantActions = () => {
  return (
    <FlexLayout className="gap-3">
      <Button href="/dashboard/tenant/edit" iconLeft="IconEdit" text="Uredi" variant="secondary" />
    </FlexLayout>
  );
};
