import Link from 'next/link';
import * as React from 'react';

import { getAlertItemData } from '@/components/AppMenu/utils/alerts';
import { Panel } from '@/components/shared/panel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Alert } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import type { Warning, WarningKind } from '../warnings';
import { RetryLine } from './RetryLine';

const WARNING_ICON: Record<WarningKind, 'IconFileInvoice' | 'IconId' | 'IconTruck' | 'IconBuilding'> = {
  invoice: 'IconFileInvoice',
  document: 'IconId',
  vehicle: 'IconTruck',
  company: 'IconBuilding',
};

const LIMIT = 5;

function WarningRow({ warning }: { warning: Warning & { alert: Alert } }) {
  const { targetUrl } = getAlertItemData(warning.alert);
  const expired = warning.severity === 'expired';
  const content = (
    <>
      <Icon
        className={cn('mt-0.5', expired ? 'text-destructive' : 'text-warning')}
        icon={WARNING_ICON[warning.kind]}
        size="s"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm">{warning.title}</span>
        <span className={cn('text-xs', expired ? 'text-destructive' : 'text-warning')}>{warning.detail}</span>
      </span>
    </>
  );
  const className = 'flex w-full items-start gap-3 px-4 py-2.5 text-left';
  return targetUrl ? (
    <Link className={cn(className, 'outline-none hover:bg-muted/50 focus-visible:bg-muted/50')} href={targetUrl}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** „Treba pažnju”: alerts (expiring documents, vehicles, insurance) + overdue invoices, expired first (lab /home). */
export function WarningsPanel({
  warnings,
  isError,
  onRetry,
}: {
  warnings: (Warning & { alert: Alert })[] | undefined;
  isError: boolean;
  onRetry(): void;
}) {
  const [showAll, setShowAll] = React.useState(false);
  const expired = warnings?.filter((warning) => warning.severity === 'expired').length ?? 0;
  const visible = showAll ? warnings : warnings?.slice(0, LIMIT);

  return (
    <Panel
      bodyClassName="p-0"
      title={
        <span className="flex items-center gap-2">
          Treba pažnju
          {expired > 0 && (
            <Badge size="sm" tone="danger">
              {expired}
            </Badge>
          )}
        </span>
      }
    >
      {isError ? (
        <RetryLine text="Upozorenja se nisu učitala." onRetry={onRetry} />
      ) : !warnings ? (
        <div className="divide-y">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="flex items-start gap-3 px-4 py-2.5" key={index}>
              <Skeleton className="size-4" />
              <span className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </span>
            </div>
          ))}
        </div>
      ) : warnings.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">Nema upozorenja.</p>
      ) : (
        <>
          <div className="divide-y">
            {visible!.map((warning) => (
              <WarningRow key={warning.id} warning={warning} />
            ))}
          </div>
          {warnings.length > LIMIT && (
            <button
              className="w-full border-t px-4 py-2 text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
              type="button"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? 'Prikaži manje' : `Još ${warnings.length - LIMIT}…`}
            </button>
          )}
        </>
      )}
    </Panel>
  );
}
