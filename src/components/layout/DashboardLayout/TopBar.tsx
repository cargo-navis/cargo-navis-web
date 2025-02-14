import { useCurrentUser } from '@/lib/hooks';
import { DisplayIf, FlexLayout, LoadingSpinner, Text } from '@/ui';
import Link from 'next/link';

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
        <Link href="/dashboard/profile">
          <FlexLayout className="bg-black-alpha-05 dark:bg-white-alpha-10 hover:bg-black-alpha-10 dark:hover:bg-white-alpha-25 rounded-l justify-center items-center px-3 py-2">
            <Text color="text-color-2" variant="text-m-medium">
              {user?.firstName} {user?.lastName[0]}.
            </Text>
          </FlexLayout>
        </Link>
      </DisplayIf>
    </FlexLayout>
  );
};
