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
  const isInvoiceNotSent = invoiceStatus === InvoiceStatus.NotSent;
  const isInvoiceSent = invoiceStatus === InvoiceStatus.Sent;
  const isInvoicePaid = invoiceStatus === InvoiceStatus.Paid;

  return (
    <FlexLayout className="items-center">
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          isInvoiceNotSent || hoveredIndex === 0 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending || isInvoiceNotSent}
        onClick={() => !isPending && !isInvoiceNotSent && onChange(InvoiceStatus.NotSent)}
        onMouseEnter={() => !isPending && setHoveredIndex(0)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Nefakturiran" variant={isInvoiceNotSent || hoveredIndex === 0 ? 'danger' : 'default'} />
      </Box>
      <Box className="w-5 h-[2px] bg-light-200 dark:bg-white-alpha-25 mx-2" />
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          isInvoiceSent || hoveredIndex === 1 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending || isInvoiceSent}
        onClick={() => !isPending && !isInvoiceSent && onChange(InvoiceStatus.Sent)}
        onMouseEnter={() => !isPending && setHoveredIndex(1)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Fakturiran" variant={isInvoiceSent || hoveredIndex === 1 ? 'info' : 'default'} />
      </Box>
      <Box className="w-5 h-[2px] bg-light-200 dark:bg-white-alpha-25 mx-2" />
      <Box
        className={clsx(
          'cursor-pointer transition-opacity',
          isInvoicePaid || hoveredIndex === 2 ? 'opacity-100' : 'opacity-50'
        )}
        isDisabled={isPending || isInvoicePaid}
        onClick={() => !isPending && !isInvoicePaid && onChange(InvoiceStatus.Paid)}
        onMouseEnter={() => !isPending && setHoveredIndex(2)}
        onMouseLeave={() => !isPending && setHoveredIndex(null)}
      >
        <Pill text="Plaćen 💰" variant={isInvoicePaid || hoveredIndex === 2 ? 'success' : 'default'} />
      </Box>
    </FlexLayout>
  );
};
