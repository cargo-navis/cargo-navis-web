import { BackButton } from '@/components/BackButton';
import { Box, Divider, FlexLayout, Skeleton, VerticalDivider } from '@/ui';

export const ContentLoader = () => {
  return (
    <FlexLayout className="py-5 flex-col gap-5">
      {/* Top Bar - Back Button + Actions */}
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
          {/* Header Section */}
          <FlexLayout className="flex-col gap-4">
            <FlexLayout className="flex-col gap-1">
              {/* Title + Invoice Status Row */}
              <FlexLayout className="items-center justify-between">
                <FlexLayout className="items-center gap-4">
                  <Skeleton borderRadius="s" height={32} width={200} />
                </FlexLayout>
                {/* Invoice Status Pills */}
                <FlexLayout className="items-center gap-2">
                  <Skeleton borderRadius="xl" height={32} width={110} />
                  <Skeleton borderRadius="xs" height={2} width={20} />
                  <Skeleton borderRadius="xl" height={32} width={95} />
                  <Skeleton borderRadius="xs" height={2} width={20} />
                  <Skeleton borderRadius="xl" height={32} width={95} />
                </FlexLayout>
              </FlexLayout>

              {/* Send to Driver */}
              <FlexLayout className="mb-2">
                <Skeleton borderRadius="s" height={24} width={240} />
              </FlexLayout>

              {/* File Upload Section */}
              <FlexLayout className="gap-4 mt-2">
                <Skeleton borderRadius="s" height={58} width={240} />
                <Skeleton borderRadius="s" height={58} width={240} />
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>

          <Divider />

          {/* Main Content - Two Column Layout */}
          <FlexLayout className="flex-row gap-5">
            {/* Left Column - Basic Info (380px) */}
            <FlexLayout className="w-[380px] flex-col gap-4">
              <FlexLayout as="section" className="flex-col gap-5">
                {/* Title */}
                <Skeleton borderRadius="s" height={24} width={120} />

                {/* Broj naloga / Referentni broj */}
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={80} />
                      <Skeleton borderRadius="s" height={20} width={100} />
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={100} />
                      <Skeleton borderRadius="s" height={20} width={90} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                {/* Prijevoznik */}
                <Box className="flex-1">
                  <FlexLayout className="flex-col gap-1">
                    <Skeleton borderRadius="xs" height={16} width={70} />
                    <Skeleton borderRadius="s" height={20} width={150} />
                  </FlexLayout>
                </Box>

                {/* Klijent / Cijena */}
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={50} />
                      <Skeleton borderRadius="s" height={20} width={130} />
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={50} />
                      <Skeleton borderRadius="s" height={20} width={70} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                {/* Vozač */}
                <FlexLayout className="flex-col gap-1">
                  <Skeleton borderRadius="xs" height={16} width={50} />
                  <Skeleton borderRadius="s" height={20} width={140} />
                </FlexLayout>

                {/* Vozilo / Priključno vozilo */}
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={50} />
                      <Skeleton borderRadius="s" height={20} width={120} />
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={110} />
                      <Skeleton borderRadius="s" height={20} width={120} />
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                {/* Disponent */}
                <Box className="flex-1">
                  <FlexLayout className="flex-col gap-1">
                    <Skeleton borderRadius="xs" height={16} width={70} />
                    <Skeleton borderRadius="s" height={20} width={140} />
                  </FlexLayout>
                </Box>
              </FlexLayout>

              <Box className="py-4">
                <Divider />
              </Box>
            </FlexLayout>

            {/* Right Column - Cargo Items */}
            <FlexLayout as="section" className="flex-1 flex-col gap-4 min-w-0">
              {/* Title */}
              <Skeleton borderRadius="s" height={24} width={80} />

              {/* Cargo Item 1 */}
              <FlexLayout className="flex-col gap-4 p-4 rounded-s bg-black-alpha-05 dark:bg-white-alpha-10">
                {/* Cargo Header */}
                <FlexLayout className="justify-between items-center">
                  <FlexLayout className="flex-col gap-1">
                    <Skeleton borderRadius="xs" height={18} width={80} />
                    <Skeleton borderRadius="xs" height={16} width={110} />
                  </FlexLayout>
                  {/* Status Progress */}
                  <FlexLayout className="items-center gap-2">
                    <Skeleton borderRadius="xl" height={32} width={100} />
                    <Skeleton borderRadius="xl" height={32} width={100} />
                  </FlexLayout>
                </FlexLayout>

                {/* Cargo Details */}
                <FlexLayout className="flex-col gap-4">
                  {/* Palete / LDM / Težina */}
                  <FlexLayout className="justify-between gap-4">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={50} />
                      <Skeleton borderRadius="s" height={20} width={100} />
                    </FlexLayout>
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={30} />
                      <Skeleton borderRadius="s" height={20} width={40} />
                    </FlexLayout>
                    <FlexLayout className="flex-col gap-1 text-end">
                      <Skeleton borderRadius="xs" height={16} width={70} />
                      <Skeleton borderRadius="s" height={20} width={60} />
                    </FlexLayout>
                  </FlexLayout>

                  {/* Opis tereta - Collapsible */}
                  <Skeleton borderRadius="s" height={40} width="100%" />

                  <Divider />

                  {/* Loading Fields - Two Columns */}
                  <FlexLayout as="section" className="justify-between gap-4">
                    {/* Loading Details */}
                    <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
                      <FlexLayout className="gap-2 items-center">
                        <Skeleton borderRadius="s" height={18} width={110} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-4 flex-1">
                        {/* Datum utovara + Referenca row */}
                        <FlexLayout className="gap-4 justify-between items-start">
                          <FlexLayout className="flex-col gap-1">
                            <Skeleton borderRadius="xs" height={16} width={140} />
                            <Skeleton borderRadius="s" height={18} width={120} />
                          </FlexLayout>
                          <FlexLayout className="flex-col gap-1 text-end">
                            <Skeleton borderRadius="xs" height={16} width={100} />
                            <Skeleton borderRadius="s" height={18} width={80} />
                          </FlexLayout>
                        </FlexLayout>
                        {/* Tvrtka utovara */}
                        <FlexLayout className="flex-col gap-1">
                          <Skeleton borderRadius="xs" height={16} width={100} />
                          <Skeleton borderRadius="s" height={18} width={150} />
                        </FlexLayout>
                        {/* Address */}
                        <FlexLayout className="flex-col gap-2">
                          <Skeleton borderRadius="xs" height={16} width={50} />
                          <Skeleton borderRadius="s" height={16} width="100%" />
                          <Skeleton borderRadius="s" height={16} width="80%" />
                        </FlexLayout>
                      </FlexLayout>
                      {/* Napomena - Collapsible */}
                      <Skeleton borderRadius="s" height={40} width="100%" />
                    </FlexLayout>

                    <VerticalDivider />

                    {/* Unloading Details */}
                    <FlexLayout className="flex-1 flex-col gap-4 min-w-0">
                      <FlexLayout className="gap-2 items-center">
                        <Skeleton borderRadius="s" height={18} width={110} />
                      </FlexLayout>
                      <FlexLayout className="flex-col gap-4 flex-1">
                        {/* Datum istovara + Referenca row */}
                        <FlexLayout className="gap-4 justify-between items-start">
                          <FlexLayout className="flex-col gap-1">
                            <Skeleton borderRadius="xs" height={16} width={140} />
                            <Skeleton borderRadius="s" height={18} width={120} />
                          </FlexLayout>
                          <FlexLayout className="flex-col gap-1 text-end">
                            <Skeleton borderRadius="xs" height={16} width={100} />
                            <Skeleton borderRadius="s" height={18} width={80} />
                          </FlexLayout>
                        </FlexLayout>
                        {/* Tvrtka istovara */}
                        <FlexLayout className="flex-col gap-1">
                          <Skeleton borderRadius="xs" height={16} width={100} />
                          <Skeleton borderRadius="s" height={18} width={150} />
                        </FlexLayout>
                        {/* Address */}
                        <FlexLayout className="flex-col gap-2">
                          <Skeleton borderRadius="xs" height={16} width={50} />
                          <Skeleton borderRadius="s" height={16} width="100%" />
                          <Skeleton borderRadius="s" height={16} width="80%" />
                        </FlexLayout>
                      </FlexLayout>
                      {/* Napomena - Collapsible */}
                      <Skeleton borderRadius="s" height={40} width="100%" />
                    </FlexLayout>
                  </FlexLayout>
                </FlexLayout>
              </FlexLayout>

              {/* Cargo Item 2 (optional - shows loading state can have multiple items) */}
              <FlexLayout className="flex-col gap-4 p-4 rounded-s bg-black-alpha-05 dark:bg-white-alpha-10">
                <FlexLayout className="justify-between items-center">
                  <FlexLayout className="flex-col gap-1">
                    <Skeleton borderRadius="xs" height={18} width={80} />
                    <Skeleton borderRadius="xs" height={16} width={110} />
                  </FlexLayout>
                  <FlexLayout className="items-center gap-2">
                    <Skeleton borderRadius="xl" height={32} width={100} />
                    <Skeleton borderRadius="xl" height={32} width={100} />
                  </FlexLayout>
                </FlexLayout>
                <FlexLayout className="flex-col gap-4">
                  <FlexLayout className="justify-between gap-4">
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={50} />
                      <Skeleton borderRadius="s" height={20} width={100} />
                    </FlexLayout>
                    <FlexLayout className="flex-col gap-1">
                      <Skeleton borderRadius="xs" height={16} width={30} />
                      <Skeleton borderRadius="s" height={20} width={40} />
                    </FlexLayout>
                    <FlexLayout className="flex-col gap-1 text-end">
                      <Skeleton borderRadius="xs" height={16} width={70} />
                      <Skeleton borderRadius="s" height={20} width={60} />
                    </FlexLayout>
                  </FlexLayout>
                  {/* Opis tereta - Collapsible */}
                  <Skeleton borderRadius="s" height={40} width="100%" />
                </FlexLayout>
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};
