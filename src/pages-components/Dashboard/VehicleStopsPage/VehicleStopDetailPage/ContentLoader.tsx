import { BackButton } from '@/components/BackButton';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, FlexLayout, Skeleton } from '@/ui';

export const StopSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
  <Box className="relative pl-6 pb-[78px]">
    <Box className="absolute left-0 top-[58px] w-4 h-4 rounded-circle bg-dark-200 dark:bg-light-850" />
    {!isLast && <Box className="absolute left-[7px] top-[58px] -bottom-[58px] w-[2px] bg-dark-200 dark:bg-light-850" />}

    <FlexLayout className="flex-col gap-3">
      <Skeleton borderRadius="xs" height={14} width={90} />
      <FlexLayout className="items-center justify-between">
        <Skeleton borderRadius="xs" height={16} width={140} />
      </FlexLayout>
      <Skeleton borderRadius="s" height={24} width={220} />
      <Skeleton borderRadius="xs" height={14} width={260} />
      <FlexLayout className="gap-3 mt-1">
        <Skeleton borderRadius="s" height={64} width="50%" />
      </FlexLayout>
      <FlexLayout className="gap-3 mt-1">
        <Skeleton borderRadius="s" height={58} width={240} />
        <Skeleton borderRadius="s" height={58} width={140} />
      </FlexLayout>
    </FlexLayout>
  </Box>
);

export const ContentLoader = () => {
  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/vehicle-stops" />

      <ClientSideOnly>
        <Box>
          <Skeleton borderRadius="s" height={28} width={180} />
          <Box className="mt-2">
            <Skeleton borderRadius="xs" height={18} width={120} />
          </Box>
        </Box>
        <Box className="max-w-[1200px]">
          <Box className="mb-6">
            <Skeleton borderRadius="s" height={32} width={180} />
          </Box>
          <Box className="pt-2">
            <StopSkeleton />
            <StopSkeleton />
            <StopSkeleton isLast />
          </Box>
        </Box>
      </ClientSideOnly>
    </FlexLayout>
  );
};
