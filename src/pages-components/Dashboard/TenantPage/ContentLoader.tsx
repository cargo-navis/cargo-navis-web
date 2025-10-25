import { Box, Divider, FlexLayout, Skeleton } from '@/ui';

export const ContentLoader = () => {
  return (
    <Box>
      <FlexLayout className="py-5 flex-col gap-5">
        {/* Header with title and action buttons */}
        <FlexLayout className="justify-between">
          <Skeleton borderRadius="s" height={40} width={240} />
          <Skeleton borderRadius="s" height={40} width={120} />
        </FlexLayout>

        {/* Two column layout */}
        <FlexLayout className="gap-8">
          {/* Left column - Company data */}
          <FlexLayout className="flex-col gap-4 max-w-[640px]">
            <Skeleton borderRadius="xs" height={24} width={120} />
            <FlexLayout className="relative flex-col gap-7 w-full">
              <FlexLayout as="section" className="flex-col gap-5">
                {/* Address section */}
                <Box className="flex-1">
                  <FlexLayout className="flex-col gap-2">
                    <Skeleton borderRadius="xs" height={20} width={64} />
                    <Skeleton borderRadius="s" height={20} width={200} />
                    <Skeleton borderRadius="s" height={20} width={160} />
                  </FlexLayout>
                </Box>

                <Box className="py-4">
                  <Divider />
                </Box>

                {/* OIB and VAT section */}
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-2">
                      <Skeleton borderRadius="xs" height={20} width={48} />
                      <Skeleton borderRadius="s" height={20} width={128} />
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-2">
                      <Skeleton borderRadius="xs" height={20} width={48} />
                      <Skeleton borderRadius="s" height={20} width={128} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                {/* License number section */}
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-2">
                      <Skeleton borderRadius="xs" height={20} width={96} />
                      <Skeleton borderRadius="s" height={20} width={144} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                {/* Insurance expiry date section */}
                <Box className="flex-1">
                  <FlexLayout className="flex-col gap-2">
                    <Skeleton borderRadius="xs" height={20} width={160} />
                    <Skeleton borderRadius="s" height={20} width={112} />
                  </FlexLayout>
                </Box>
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>

          {/* Right column - Shipment data */}
          <FlexLayout className="flex-col gap-4 max-w-[640px]">
            <Skeleton borderRadius="xs" height={24} width={140} />
            <FlexLayout className="relative flex-col gap-7 w-full">
              {/* Shipment footer section */}
              <FlexLayout as="section" className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={20} width={120} />
                <Skeleton borderRadius="s" height={20} width="100%" />
                <Skeleton borderRadius="s" height={20} width="80%" />
              </FlexLayout>

              {/* Transport terms section */}
              <FlexLayout as="section" className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={20} width={140} />
                <Skeleton borderRadius="s" height={20} width="100%" />
                <Skeleton borderRadius="s" height={20} width="90%" />
                <Skeleton borderRadius="s" height={20} width="60%" />
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </Box>
  );
};
