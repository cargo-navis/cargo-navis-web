import { FlexLayout, Skeleton } from '@/ui';

export const ContentLoader = () => (
  <FlexLayout className="flex-col gap-6">
    {/* New password field */}
    <FlexLayout className="flex-col gap-2">
      <Skeleton borderRadius="xs" height={16} width={100} />
      <Skeleton borderRadius="s" height={48} width="100%" />
    </FlexLayout>
    {/* Confirm password field */}
    <FlexLayout className="flex-col gap-2">
      <Skeleton borderRadius="xs" height={16} width={120} />
      <Skeleton borderRadius="s" height={48} width="100%" />
    </FlexLayout>
    {/* Submit button */}
    <Skeleton borderRadius="m" height={48} width="100%" />
  </FlexLayout>
);
