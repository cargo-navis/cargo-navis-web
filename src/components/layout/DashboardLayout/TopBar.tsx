import { useCurrentUser } from '@/lib/hooks';
import { DisplayIf, FlexLayout, LoadingSpinner, Text } from '@/ui';

export const TopBar = () => {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <FlexLayout className="justify-end w-full p-2 border-0 border-b-[1px] border-b-black-alpha-10 dark:border-b-white-alpha-10">
      <DisplayIf
        condition={!!user && !isLoading}
        fallback={
          <FlexLayout className="items-center h-[48px]">
            <LoadingSpinner />
          </FlexLayout>
        }
      >
        <FlexLayout className="text-dark-700 dark:text-light-100  justify-center items-center px-3 py-2 gap-2">
          <Text variant="text-m-medium">
            {user?.firstName} {user?.lastName[0]}.
          </Text>
        </FlexLayout>
      </DisplayIf>
    </FlexLayout>
  );
};
