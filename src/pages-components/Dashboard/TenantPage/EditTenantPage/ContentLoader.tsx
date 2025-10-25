import { Box, FlexLayout, Skeleton } from '@/ui';

export const ContentLoader = () => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Skeleton borderRadius="s" height={40} width={300} />
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        {/* Back button */}
        <Skeleton borderRadius="s" height={32} width={120} />

        {/* Form with two columns */}
        <FlexLayout className="gap-[40px]">
          {/* Left column - Company data */}
          <FlexLayout as="section" className="flex-col gap-4 w-[640px]">
            <Skeleton borderRadius="xs" height={24} width={120} />

            {/* Name field */}
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={48} />
              <Skeleton borderRadius="s" height={40} width="100%" />
            </FlexLayout>

            {/* VAT and OIB fields */}
            <FlexLayout className="gap-2">
              <Box className="flex-1">
                <FlexLayout className="flex-col gap-2">
                  <Skeleton borderRadius="xs" height={16} width={48} />
                  <Skeleton borderRadius="s" height={40} width="100%" />
                </FlexLayout>
              </Box>
              <Box className="flex-1">
                <FlexLayout className="flex-col gap-2">
                  <Skeleton borderRadius="xs" height={16} width={48} />
                  <Skeleton borderRadius="s" height={40} width="100%" />
                </FlexLayout>
              </Box>
            </FlexLayout>

            {/* License number field */}
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={96} />
              <Skeleton borderRadius="s" height={40} width="100%" />
            </FlexLayout>

            {/* Insurance expiry date field */}
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={160} />
              <Skeleton borderRadius="s" height={40} width="100%" />
            </FlexLayout>

            {/* Address section */}
            <FlexLayout className="flex-1 flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={112} />

              {/* Street field */}
              <FlexLayout className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={16} width={48} />
                <Skeleton borderRadius="s" height={40} width="100%" />
              </FlexLayout>

              {/* Country field */}
              <FlexLayout className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={16} width={64} />
                <Skeleton borderRadius="s" height={40} width="100%" />
              </FlexLayout>

              {/* Postal code field */}
              <FlexLayout className="flex-col gap-2">
                <Skeleton borderRadius="xs" height={16} width={96} />
                <Skeleton borderRadius="s" height={40} width="100%" />
              </FlexLayout>
            </FlexLayout>

            <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />

            {/* Submit button */}
            <Skeleton borderRadius="s" height={40} width="100%" />
          </FlexLayout>

          {/* Right column - Shipment data */}
          <FlexLayout as="section" className="flex-col gap-4 w-[640px]">
            <FlexLayout className="gap-2 items-center">
              <Skeleton borderRadius="xs" height={24} width={140} />
            </FlexLayout>

            {/* Shipment footer field */}
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={120} />
              <Skeleton borderRadius="s" height={40} width="100%" />
            </FlexLayout>

            {/* Transport terms field (textarea) */}
            <FlexLayout className="flex-col gap-2">
              <Skeleton borderRadius="xs" height={16} width={140} />
              <Skeleton borderRadius="s" height={240} width="100%" />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </Box>
  );
};
