import { InvoiceStatusBadge } from '@/components/shared/invoice-status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { useChangeInvoiceStatus } from './actions';
import { formatEuro } from './format';
import { INVOICE_STATUS_LABEL, INVOICE_STATUSES, invoiceDateLines, type InvoiceInfo } from './invoice';

/** The invoice pill (same tones everywhere: table, Faktura panel, summary strip). */
export function InvoiceBadge({ info, size }: { info: InvoiceInfo; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <InvoiceStatusBadge
      daysPastDue={info.daysPastDue}
      isOverdue={info.isLate}
      size={size}
      status={info.status}
      unloadedDaysAgo={info.unloadedDaysAgo}
    />
  );
}

/**
 * „Status fakture” (lab /tables invoice-cell.tsx, picked B amber): badge + the one detail that matters now; hover lists
 * the amount and dates. `align="start"` for the Faktura panel.
 */
export function InvoiceCell({
  info,
  amount,
  align = 'end',
}: {
  info: InvoiceInfo;
  amount: number;
  align?: 'start' | 'end';
}) {
  const lines = invoiceDateLines(info);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={cn(
              'flex w-fit min-w-0 cursor-default flex-col gap-0.5',
              align === 'end' ? 'ml-auto items-end text-right' : 'items-start text-left'
            )}
          />
        }
      >
        <InvoiceBadge info={info} />
        <span className={cn('text-xs tabular-nums', info.detailClass)}>{info.detail}</span>
      </TooltipTrigger>
      <TooltipContent className="w-60 p-3" side="left">
        <div className="flex flex-col gap-1 text-xs tabular-nums">
          <span className="font-medium">
            {INVOICE_STATUS_LABEL[info.status]} · {formatEuro(amount)}
          </span>
          {lines.map((line) => (
            <span className="opacity-80" key={line}>
              {line}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/** „Promijeni ▾”: the invoice status, no confirm (Faktura panel and the list's quick look). */
export function InvoiceStatusMenu({ shipment }: { shipment: Shipment }) {
  const { change, isPending } = useChangeInvoiceStatus();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button loading={isPending} size="sm" variant="ghost" />}>
        Promijeni <Icon data-icon="inline-end" icon="IconChevronDown" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup
          value={shipment.invoiceStatus}
          onValueChange={(value) => void change(shipment, value as InvoiceStatus)}
        >
          {INVOICE_STATUSES.map((status) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {INVOICE_STATUS_LABEL[status]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
