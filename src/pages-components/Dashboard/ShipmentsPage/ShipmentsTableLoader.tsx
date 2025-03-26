import React from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { Box, FlexLayout, Skeleton } from '@/ui';

export const ShipmentsTableLoader: React.FC = () => {
  return (
    <ClientSideOnly>
      <FlexLayout className="flex-col gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index}>
            <Skeleton borderRadius="xs" height={48} id={`shipment-table-loader-${index}`} width="100%" />
          </Box>
        ))}
      </FlexLayout>
    </ClientSideOnly>
  );
};
