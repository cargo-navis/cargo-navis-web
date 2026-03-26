import React from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, FlexLayout, Skeleton } from '@/ui';

export const ShipmentsTableLoader: React.FC = () => {
  return (
    <ClientSideOnly>
      <FlexLayout className="flex-col gap-5 w-full">
        <FlexLayout className="mb-4 justify-between items-center">
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
        <Box className="border-b border-b-black-alpha-10 dark:border-b-white-alpha-25  pb-3 mb-4">
          <FlexLayout className="gap-4 items-center justify-between">
            <Skeleton borderRadius="m" height={22} width={140} /> {/* Broj naloga */}
            <Skeleton borderRadius="m" height={22} width={150} /> {/* Klijent / Prijevozik */}
            <Skeleton borderRadius="m" height={22} width={100} /> {/* Cijena */}
            <Skeleton borderRadius="m" height={22} width={90} /> {/* Datum utovara */}
            <Skeleton borderRadius="m" height={22} width={90} /> {/* Datum istovara */}
            <Skeleton borderRadius="m" height={22} width={100} /> {/* LDM / Težina */}
            <Skeleton borderRadius="m" height={22} width={80} /> {/* Broj paleta */}
            {/* <Skeleton borderRadius="m" height={22} width={120} /> {/* Adrese utovara i istovara */}
            {/* <Skeleton borderRadius="m" height={22} width={150} /> {/* Vozilo i vozač */}
            <Skeleton borderRadius="m" height={22} width={120} /> {/* Status */}
          </FlexLayout>
        </Box>

        {/* Table Rows Skeleton */}
        <FlexLayout className="flex-col gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Box
              className="border-b last:border-b-0 border-b-black-alpha-05 dark:border-b-white-alpha-25 pb-3"
              key={index}
            >
              <FlexLayout className="gap-4 items-center py-2 justify-between">
                {/* Broj naloga */}
                <FlexLayout className="items-center gap-2 justify-between" style={{ width: '140px' }}>
                  <Skeleton borderRadius="m" height={22} width={100} />
                </FlexLayout>

                {/* Klijent / Prijevozik */}
                <Box className="flex justify-between" style={{ width: '150px' }}>
                  <Skeleton borderRadius="m" height={22} width={85} />
                </Box>

                {/* Cijena */}
                <Box className="flex justify-between" style={{ width: '100px' }}>
                  <Skeleton borderRadius="m" height={22} width={45} />
                </Box>

                {/* Datum utovara */}
                <Box className="flex justify-between" style={{ width: '90px' }}>
                  <Skeleton borderRadius="m" height={22} width={70} />
                </Box>

                {/* Datum istovara */}
                <Box className="flex justify-between" style={{ width: '90px' }}>
                  <Skeleton borderRadius="m" height={22} width={70} />
                </Box>

                {/* LDM / Težina */}
                <Box className="flex justify-between" style={{ width: '100px' }}>
                  <Skeleton borderRadius="m" height={22} width={30} />
                </Box>

                {/* Broj paleta */}
                <Box className="flex justify-between" style={{ width: '80px' }}>
                  <Skeleton borderRadius="m" height={22} width={25} />
                </Box>

                {/* Adrese utovara i istovara */}
                <Box className="flex justify-between" style={{ width: '120px' }}>
                  <Skeleton borderRadius="m" height={22} width={100} />
                </Box>

                {/* Vozilo i vozač */}
                <FlexLayout className="flex-col gap-2 justify-between" style={{ width: '150px' }}>
                  <FlexLayout className="items-center gap-2 justify-start">
                    <Skeleton borderRadius="s" height={16} width={16} />
                    <Skeleton borderRadius="s" height={16} width="60%" />
                  </FlexLayout>
                  <FlexLayout className="items-center gap-2 justify-start">
                    <Skeleton borderRadius="s" height={16} width={16} />
                    <Box className="flex-1">
                      <Skeleton borderRadius="s" height={16} width="90%" />
                    </Box>
                  </FlexLayout>
                </FlexLayout>

                {/* Status */}
                <FlexLayout className="flex-col gap-2 justify-between" style={{ width: '120px' }}>
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
