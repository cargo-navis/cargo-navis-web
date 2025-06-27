import clsx from 'clsx';
import { useState } from 'react';

import { InvoiceStatus } from '@/lib/api/shipments';
import { Box, FlexLayout, Pill } from '@/ui';

interface InvoiceItemProps {
  isPending: boolean;
  invoiceStatus: InvoiceStatus;
  onChange(invoiceStatus: InvoiceStatus): void;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoiceStatus, onChange, isPending }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isInvoiceSent = invoiceStatus === InvoiceStatus.Sent;

  return (
    <FlexLayout className="items-center">
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          !isInvoiceSent || hoveredIndex === 0 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending}
        onClick={() => !isPending && onChange(InvoiceStatus.NotSent)}
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
        onClick={() => !isPending && onChange(InvoiceStatus.Sent)}
        onMouseEnter={() => !isPending && setHoveredIndex(1)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Fakturiran" variant={isInvoiceSent || hoveredIndex === 1 ? 'success' : 'default'} />
      </Box>
    </FlexLayout>
  );
};
