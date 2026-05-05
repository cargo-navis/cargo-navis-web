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
            <FlexLayout style={{ width: '300px' }}>
              <Skeleton borderRadius="m" height={22} width={100} /> {/* Nalog */}
            </FlexLayout>
            <Box style={{ width: '120px' }}>
              <Skeleton borderRadius="m" height={22} width={60} /> {/* Cijena */}
            </Box>
            <Box style={{ width: '380px' }}>
              <Skeleton borderRadius="m" height={22} width={140} /> {/* Utovar / Istovar */}
            </Box>
            <Box style={{ width: '110px' }}>
              <Skeleton borderRadius="m" height={22} width={100} /> {/* LDM / Težina */}
            </Box>
            <Box style={{ width: '200px' }}>
              <Skeleton borderRadius="m" height={22} width={120} /> {/* Vozilo / Vozač */}
            </Box>
            <Box style={{ width: '110px' }}>
              <Skeleton borderRadius="m" height={22} width={90} /> {/* Broj paleta */}
            </Box>
            <FlexLayout className="justify-end" style={{ width: '120px' }}>
              <Skeleton borderRadius="m" height={22} width={110} /> {/* Status */}
            </FlexLayout>
          </FlexLayout>
        </Box>
        <Divider />

        {/* Table Rows Skeleton */}
        <FlexLayout className="flex-col">
          {Array.from({ length: 7 }).map((_, index) => (
            <Box className="border-b last:border-b-0 border-b-black-alpha-05 dark:border-b-white-alpha-25" key={index}>
              <FlexLayout className="items-center py-6 justify-between">
                {/* Nalog */}
                <FlexLayout className="flex-col gap-1" style={{ width: '300px' }}>
                  <Skeleton borderRadius="m" height={22} width={160} />
                  <Skeleton borderRadius="m" height={16} width={100} />
                </FlexLayout>

                {/* Cijena */}
                <Box style={{ width: '120px' }}>
                  <Skeleton borderRadius="m" height={22} width={70} />
                </Box>

                {/* Utovar / Istovar */}
                <FlexLayout className="items-center gap-3" style={{ width: '380px' }}>
                  <FlexLayout className="flex-col gap-1 flex-1">
                    <Skeleton borderRadius="m" height={18} width={120} />
                    <Skeleton borderRadius="m" height={14} width={70} />
                  </FlexLayout>
                  <Skeleton borderRadius="m" height={14} width={14} />
                  <FlexLayout className="flex-col gap-1 flex-1">
                    <Skeleton borderRadius="m" height={18} width={120} />
                    <Skeleton borderRadius="m" height={14} width={70} />
                  </FlexLayout>
                </FlexLayout>

                {/* LDM / Težina */}
                <FlexLayout className="flex-col gap-1" style={{ width: '110px' }}>
                  <Skeleton borderRadius="m" height={18} width={40} />
                  <Skeleton borderRadius="m" height={14} width={55} />
                </FlexLayout>

                {/* Vozilo / Vozač */}
                <FlexLayout className="flex-col gap-1" style={{ width: '200px' }}>
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
                <Box style={{ width: '110px' }}>
                  <Skeleton borderRadius="m" height={22} width={30} />
                </Box>

                {/* Status */}
                <FlexLayout className="flex-col gap-1 items-end" style={{ width: '120px' }}>
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
