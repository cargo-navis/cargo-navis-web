import React from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, Divider, FlexLayout, Skeleton } from '@/ui';

export const ShipmentsTableLoader: React.FC = () => {
  return (
    <ClientSideOnly>
      <FlexLayout className="flex-col w-full">
        <FlexLayout className="justify-between items-center">
          <FlexLayout className="flex-col gap-3">
            <Skeleton borderRadius="m" height={44} width={200} />
            <Skeleton borderRadius="m" height={24} width={240} />
          </FlexLayout>
          <FlexLayout className="flex gap-2">
            <Skeleton borderRadius="m" height={32} width={132} />
            <Skeleton borderRadius="m" height={32} width={32} />
            <Skeleton borderRadius="m" height={32} width={32} />
            <Skeleton borderRadius="m" height={32} width={132} />
          </FlexLayout>
        </FlexLayout>
        {/* Table Header Skeleton */}
        <Box className="mt-4">
          <FlexLayout className="gap-4 items-center justify-between h-[64px]">
            <FlexLayout style={{ width: '336px' }}>
              <Skeleton borderRadius="m" height={22} width={100} /> {/* Nalog */}
            </FlexLayout>
            <Skeleton borderRadius="m" height={22} width={60} /> {/* Cijena */}
            <Skeleton borderRadius="m" height={22} width={110} /> {/* Utovar spreman */}
            <Skeleton borderRadius="m" height={22} width={100} /> {/* Rok istovara */}
            <Skeleton borderRadius="m" height={22} width={140} /> {/* LDM / Težina */}
            <Skeleton borderRadius="m" height={22} width={100} /> {/* Broj paleta */}
            <Skeleton borderRadius="m" height={22} width={120} /> {/* Status */}
          </FlexLayout>
        </Box>
        <Divider />

        {/* Table Rows Skeleton */}
        <FlexLayout className="flex-col">
          {Array.from({ length: 7 }).map((_, index) => (
            <Box className="border-b last:border-b-0 border-b-black-alpha-05 dark:border-b-white-alpha-25" key={index}>
              <FlexLayout className="items-center py-6 justify-between">
                {/* Nalog */}
                <FlexLayout className="flex-col gap-1" style={{ width: '342px' }}>
                  <Skeleton borderRadius="m" height={22} width={120} />
                  <Skeleton borderRadius="m" height={16} width={85} />
                </FlexLayout>

                {/* Cijena */}
                <Box className="flex justify-between" style={{ width: '100px' }}>
                  <Skeleton borderRadius="m" height={22} width={45} />
                </Box>

                {/* Utovar spreman */}
                <Box className="flex justify-between" style={{ width: '110px' }}>
                  <Skeleton borderRadius="m" height={22} width={80} />
                </Box>

                {/* Rok istovara */}
                <Box className="flex justify-between" style={{ width: '100px' }}>
                  <Skeleton borderRadius="m" height={22} width={80} />
                </Box>

                {/* LDM / Težina */}
                <FlexLayout className="flex-col gap-1" style={{ width: '140px' }}>
                  <Skeleton borderRadius="m" height={18} width={40} />
                  <Skeleton borderRadius="m" height={14} width={55} />
                </FlexLayout>

                {/* Broj paleta */}
                <Box className="flex justify-between" style={{ width: '100px' }}>
                  <Skeleton borderRadius="m" height={22} width={25} />
                </Box>

                {/* Status */}
                <FlexLayout className="flex-col gap-1 items-end" style={{ width: '120px' }}>
                  <Skeleton borderRadius="m" height={18} width={110} />
                  <Skeleton borderRadius="m" height={18} width={95} />
                </FlexLayout>
              </FlexLayout>
            </Box>
          ))}
        </FlexLayout>
      </FlexLayout>
    </ClientSideOnly>
  );
};
