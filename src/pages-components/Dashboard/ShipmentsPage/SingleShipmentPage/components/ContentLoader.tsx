import { BackButton } from '@/components/BackButton';
import { Box, Divider, FlexLayout, Skeleton } from '@/ui';

export const ContentLoader = () => {
  return (
    <Box>
      <FlexLayout className="py-5 flex-col gap-5">
        <FlexLayout className="justify-between">
          <BackButton targetLocation="/dashboard/shipments" />
          <FlexLayout className="items-center gap-3">
            <Skeleton borderRadius="s" height={40} width={142} />
            <Skeleton borderRadius="s" height={40} width={140} />
            <Skeleton borderRadius="xs" height={40} width={32} />
          </FlexLayout>
        </FlexLayout>
        <Box className="max-w-[1400px]">
          <FlexLayout className="relative flex-col gap-5 w-full">
            <FlexLayout className="flex-col gap-4">
              <FlexLayout className="flex-col gap-1">
                <FlexLayout className="items-center gap-4">
                  <Skeleton borderRadius="s" height={40} width={300} />
                </FlexLayout>
              </FlexLayout>
              <FlexLayout className="items-baseline justify-between">
                <FlexLayout className="items-center gap-2">
                  <Skeleton borderRadius="xl" height={32} width={138} />
                  <Skeleton borderRadius="xs" height={2} width={64} />
                  <Skeleton borderRadius="xl" height={32} width={103} />
                  <Skeleton borderRadius="xs" height={2} width={64} />
                  <Skeleton borderRadius="xl" height={32} width={106} />
                </FlexLayout>
                <FlexLayout className="items-center gap-2">
                  <Skeleton borderRadius="xl" height={32} width={124} />
                  <Skeleton borderRadius="xs" height={2} width={24} />
                  <Skeleton borderRadius="xl" height={32} width={105} />
                  <Skeleton borderRadius="xs" height={2} width={24} />
                  <Skeleton borderRadius="xl" height={32} width={94} />
                </FlexLayout>
              </FlexLayout>
            </FlexLayout>
            <Divider />
            <FlexLayout className="flex-row gap-7">
              <FlexLayout className="flex-1 flex-col gap-4">
                <FlexLayout as="section" className="flex-col gap-5">
                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={80} />
                        <Skeleton borderRadius="s" height={32} width={128} />
                      </FlexLayout>
                    </Box>
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={96} />
                        <Skeleton borderRadius="s" height={32} width={112} />
                      </FlexLayout>
                    </Box>
                  </FlexLayout>

                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={20} width={80} />
                      <Skeleton borderRadius="s" height={32} width={160} />
                    </FlexLayout>
                  </Box>

                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={64} />
                        <Skeleton borderRadius="s" height={32} width={144} />
                      </FlexLayout>
                    </Box>
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={64} />
                        <Skeleton borderRadius="s" height={32} width={80} />
                      </FlexLayout>
                    </Box>
                  </FlexLayout>

                  <FlexLayout className="flex-col gap-2">
                    <Skeleton borderRadius="xs" height={20} width={64} />
                    <Skeleton borderRadius="s" height={32} width={176} />
                  </FlexLayout>

                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={64} />
                        <Skeleton borderRadius="s" height={32} width={128} />
                      </FlexLayout>
                    </Box>
                    <Box className="flex-1">
                      <FlexLayout className="flex-col gap-1">
                        <Skeleton borderRadius="xs" height={20} width={112} />
                        <Skeleton borderRadius="s" height={32} width={144} />
                      </FlexLayout>
                    </Box>
                  </FlexLayout>

                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={20} width={80} />
                      <Skeleton borderRadius="s" height={32} width={160} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                <Box className="py-4">
                  <Divider />
                </Box>

                <FlexLayout as="section" className="flex-col gap-6">
                  <FlexLayout className="gap-4">
                    <FlexLayout className="flex-col flex-1 gap-4">
                      <Skeleton borderRadius="xs" height={24} width={112} />
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="s" height={20} width={192} />
                        <Skeleton borderRadius="s" height={20} width={160} />
                        <Skeleton borderRadius="s" height={20} width={128} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={96} />
                        <Skeleton borderRadius="s" height={20} width={112} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="s" height={16} width={128} />
                        <Skeleton borderRadius="s" height={20} width={144} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={96} />
                        <Skeleton borderRadius="s" height={16} width="100%" />
                        <Skeleton borderRadius="s" height={16} width="75%" />
                      </FlexLayout>
                    </FlexLayout>
                    <FlexLayout className="flex-col flex-1 gap-4">
                      <Skeleton borderRadius="xs" height={24} width={112} />
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="s" height={20} width={192} />
                        <Skeleton borderRadius="s" height={20} width={160} />
                        <Skeleton borderRadius="s" height={20} width={128} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={96} />
                        <Skeleton borderRadius="s" height={20} width={112} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="s" height={16} width={128} />
                        <Skeleton borderRadius="s" height={20} width={144} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={96} />
                        <Skeleton borderRadius="s" height={16} width="100%" />
                        <Skeleton borderRadius="s" height={16} width="66%" />
                      </FlexLayout>
                    </FlexLayout>
                  </FlexLayout>
                </FlexLayout>
              </FlexLayout>

              <FlexLayout as="section" className="flex-1 flex-col gap-4">
                <Skeleton borderRadius="xs" height={40} width={120} />
                {/* Cargo items skeleton */}
                <Box className="p-4 rounded-s bg-black-alpha-10 dark:bg-white-alpha-10">
                  <FlexLayout className="flex-col gap-4">
                    <Skeleton borderRadius="xs" height={24} width={80} />
                    <FlexLayout className="flex-col gap-6">
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={80} />
                        <Skeleton borderRadius="s" height={40} width={128} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={64} />
                        <Skeleton borderRadius="xs" height={40} width={196} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={58} />
                        <Skeleton borderRadius="xs" height={40} width={96} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-2">
                        <Skeleton borderRadius="xs" height={16} width={48} />
                        <Skeleton borderRadius="s" height={40} width="75%" />
                      </FlexLayout>
                    </FlexLayout>
                  </FlexLayout>
                </Box>
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>
        </Box>
      </FlexLayout>
    </Box>
  );
};
