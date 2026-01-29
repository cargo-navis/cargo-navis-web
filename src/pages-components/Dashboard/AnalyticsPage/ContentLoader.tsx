import { Box, FlexLayout, Skeleton } from '@/ui';

const StatCardSkeleton = () => (
  <FlexLayout className="flex-col flex-1 p-4 gap-3 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
    <Skeleton borderRadius="s" height={20} width={140} />
    <Skeleton borderRadius="s" height={28} width={80} />
  </FlexLayout>
);

const TableSkeleton = () => (
  <FlexLayout className="flex-1 flex-col gap-4 p-4 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
    <Skeleton borderRadius="s" height={24} width={120} />
    <Skeleton borderRadius="s" height={40} width="100%" />
    <FlexLayout className="flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton borderRadius="s" height={44} key={index} width="100%" />
      ))}
    </FlexLayout>
  </FlexLayout>
);

export const ContentLoader = () => {
  return (
    <FlexLayout className="flex-col gap-5">
      {/* Stats Cards */}
      <FlexLayout className="w-full gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </FlexLayout>

      {/* Chart */}
      <Box className="box-content h-[400px] p-5 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
        <Skeleton borderRadius="m" height="100%" width="100%" />
      </Box>

      {/* Tables */}
      <FlexLayout className="w-full gap-5">
        <TableSkeleton />
        <TableSkeleton />
      </FlexLayout>
    </FlexLayout>
  );
};
