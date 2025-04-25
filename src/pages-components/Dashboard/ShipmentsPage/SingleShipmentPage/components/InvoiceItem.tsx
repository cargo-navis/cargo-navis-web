import clsx from 'clsx';
import { useState } from 'react';

import { Box, FlexLayout, Pill } from '@/ui';

interface InvoiceItemProps {
  isPending: boolean;
  isInvoiceSent: boolean;
  onChange(isInvoiceSent: boolean): void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ isInvoiceSent, onChange, isPending }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <FlexLayout className="items-center">
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          !isInvoiceSent || hoveredIndex === 0 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending}
        onClick={() => !isPending && onChange(false)}
        onMouseEnter={() => !isPending && setHoveredIndex(0)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Nefakturiran" variant={!isInvoiceSent || hoveredIndex === 0 ? 'danger' : 'default'} />
      </Box>
      <Box className="w-5 h-[2px] bg-light-200 dark:bg-white-alpha-25 mx-2" />
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          isInvoiceSent || hoveredIndex === 1 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending}
        onClick={() => !isPending && onChange(true)}
        onMouseEnter={() => !isPending && setHoveredIndex(1)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Fakturiran" variant={isInvoiceSent || hoveredIndex === 1 ? 'success' : 'default'} />
      </Box>
    </FlexLayout>
  );
};
