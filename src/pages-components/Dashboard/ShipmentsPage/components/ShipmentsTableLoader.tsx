import React, { CSSProperties } from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, Divider, FlexLayout, Skeleton } from '@/ui';

const flexBasis = (px: number, grow = 0): CSSProperties => ({
  flex: `${grow} 1 ${px}px`,
  minWidth: 0,
});

export const ShipmentsTableLoader: React.FC = () => {
  return (
    <ClientSideOnly>
      <FlexLayout className="flex-col w-full min-w-0">
        <FlexLayout className="justify-between items-center">
          <FlexLayout className="flex-col gap-3">
            <Skeleton borderRadius="m" height={44} width={340} /> {/* Sort selector */}
            <Skeleton borderRadius="m" height={24} width={240} /> {/* Pagination info */}
          </FlexLayout>
          <FlexLayout className="flex-col gap-3 items-end">
            <Skeleton borderRadius="m" height={44} width={200} /> {/* Page size selector */}
            <FlexLayout className="flex gap-2">
              <Skeleton borderRadius="m" height={32} width={132} />
              <Skeleton borderRadius="m" height={32} width={32} />
              <Skeleton borderRadius="m" height={32} width={32} />
              <Skeleton borderRadius="m" height={32} width={132} />
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
        {/* Table Header Skeleton */}
        <Box className="mt-4 w-full min-w-0">
          <FlexLayout className="gap-4 items-center justify-between h-[64px] min-w-0">
            <FlexLayout style={flexBasis(300, 1)}>
              <Skeleton borderRadius="m" height={22} width={100} /> {/* Nalog */}
            </FlexLayout>
            <Box style={flexBasis(120)}>
              <Skeleton borderRadius="m" height={22} width={60} /> {/* Cijena */}
            </Box>
            <Box style={flexBasis(380, 2)}>
              <Skeleton borderRadius="m" height={22} width={140} /> {/* Utovar / Istovar */}
            </Box>
            <Box style={flexBasis(110)}>
              <Skeleton borderRadius="m" height={22} width={100} /> {/* LDM / Težina */}
            </Box>
            <Box style={flexBasis(200, 1)}>
              <Skeleton borderRadius="m" height={22} width={120} /> {/* Vozilo / Vozač */}
            </Box>
            <Box style={flexBasis(110)}>
              <Skeleton borderRadius="m" height={22} width={90} /> {/* Broj paleta */}
            </Box>
            <FlexLayout className="justify-end" style={flexBasis(120)}>
              <Skeleton borderRadius="m" height={22} width={110} /> {/* Status */}
            </FlexLayout>
          </FlexLayout>
        </Box>
        <Divider />

        {/* Table Rows Skeleton */}
        <FlexLayout className="flex-col w-full min-w-0">
          {Array.from({ length: 7 }).map((_, index) => (
            <Box className="border-b last:border-b-0 border-b-black-alpha-05 dark:border-b-white-alpha-25" key={index}>
              <FlexLayout className="items-center py-6 justify-between gap-4 min-w-0">
                {/* Nalog */}
                <FlexLayout className="flex-col gap-1" style={flexBasis(300, 1)}>
                  <Skeleton borderRadius="m" height={22} width={160} />
                  <Skeleton borderRadius="m" height={16} width={100} />
                </FlexLayout>

                {/* Cijena */}
                <Box style={flexBasis(120)}>
                  <Skeleton borderRadius="m" height={22} width={70} />
                </Box>

                {/* Utovar / Istovar */}
                <FlexLayout className="items-center gap-3" style={flexBasis(380, 2)}>
                  <FlexLayout className="flex-col gap-1 flex-1 min-w-0">
                    <Skeleton borderRadius="m" height={18} width={120} />
                    <Skeleton borderRadius="m" height={14} width={70} />
                  </FlexLayout>
                  <Skeleton borderRadius="m" height={14} width={14} />
                  <FlexLayout className="flex-col gap-1 flex-1 min-w-0">
                    <Skeleton borderRadius="m" height={18} width={120} />
                    <Skeleton borderRadius="m" height={14} width={70} />
                  </FlexLayout>
                </FlexLayout>

                {/* LDM / Težina */}
                <FlexLayout className="flex-col gap-1" style={flexBasis(110)}>
                  <Skeleton borderRadius="m" height={18} width={40} />
                  <Skeleton borderRadius="m" height={14} width={55} />
                </FlexLayout>

                {/* Vozilo / Vozač */}
                <FlexLayout className="flex-col gap-1" style={flexBasis(200, 1)}>
                  <FlexLayout className="items-center gap-1">
                    <Skeleton borderRadius="m" height={14} width={14} />
                    <Skeleton borderRadius="m" height={16} width={90} />
                  </FlexLayout>
                  <FlexLayout className="items-center gap-1">
                    <Skeleton borderRadius="m" height={14} width={14} />
                    <Skeleton borderRadius="m" height={14} width={120} />
                  </FlexLayout>
                </FlexLayout>

                {/* Broj paleta */}
                <Box style={flexBasis(110)}>
                  <Skeleton borderRadius="m" height={22} width={30} />
                </Box>

                {/* Status */}
                <FlexLayout className="flex-col gap-1 items-end" style={flexBasis(120)}>
                  <Skeleton borderRadius="m" height={20} width={110} />
                </FlexLayout>
              </FlexLayout>
            </Box>
          ))}
        </FlexLayout>
      </FlexLayout>
    </ClientSideOnly>
  );
};
