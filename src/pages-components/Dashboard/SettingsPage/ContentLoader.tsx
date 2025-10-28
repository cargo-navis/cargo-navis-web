import { Box, FlexLayout, Skeleton } from '@/ui';

export const ContentLoader = () => {
  return (
    <FlexLayout className="flex-col gap-8">
      <FlexLayout className="flex-col gap-[40px]">
        {/* Page heading */}
        <Skeleton borderRadius="s" height={40} width={240} />
      </FlexLayout>

      <FlexLayout className="flex-col gap-[40px] w-[480px]">
        {/* User Profile Section */}
        <FlexLayout className="flex-col gap-4">
          <FlexLayout className="flex-col gap-3">
            {/* User name */}
            <Skeleton borderRadius="s" height={32} width={280} />
            {/* Position pills */}
            <FlexLayout className="items-center gap-2">
              <Skeleton borderRadius="m" height={26} width={100} />
              <Skeleton borderRadius="m" height={26} width={120} />
            </FlexLayout>
          </FlexLayout>
          {/* Email input */}
          <Box>
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={20} width={60} />
              <Skeleton borderRadius="s" height={48} width="100%" />
            </FlexLayout>
          </Box>
        </FlexLayout>

        {/* Password Update Form */}
        <FlexLayout className="flex-col gap-4">
          {/* Form title */}
          <Skeleton borderRadius="s" height={24} width={180} />
          <FlexLayout className="flex-col gap-3">
            {/* New password input */}
            <Box>
              <FlexLayout className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={20} width={100} />
                <Skeleton borderRadius="s" height={48} width="100%" />
              </FlexLayout>
            </Box>
            {/* Confirm password input */}
            <Box>
              <FlexLayout className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={20} width={140} />
                <Skeleton borderRadius="s" height={48} width="100%" />
              </FlexLayout>
            </Box>
            {/* Submit button */}
            <Skeleton borderRadius="s" height={48} width="100%" />
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};
