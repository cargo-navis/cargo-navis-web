import React from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, FlexLayout, Skeleton } from '@/ui';

export const ShipmentsTableLoader: React.FC = () => {
  return (
    <ClientSideOnly>
      <FlexLayout className="flex-col gap-5">
        {Array.from({ length: 7 }).map((_, index) => (
          <Box key={index}>
            <Skeleton borderRadius="xxs" height={40} id={`shipment-table-loader-${index}`} width="100%" />
          </Box>
        ))}
      </FlexLayout>
    </ClientSideOnly>
  );
};
