import { FlexLayout, LoadingSpinner } from '@/ui';

export const LoadingPage = () => {
  return (
    <FlexLayout className="items-center justify-center h-full w-full">
      <LoadingSpinner size="xl" />
    </FlexLayout>
  );
};
