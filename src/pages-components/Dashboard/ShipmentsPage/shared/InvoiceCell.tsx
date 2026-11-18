import { InvoiceStatusBadge } from '@/components/shared/invoice-status-badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { formatEuro } from './format';
import { INVOICE_STATUS_LABEL, invoiceDateLines, type InvoiceInfo } from './invoice';

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
