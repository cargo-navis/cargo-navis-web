import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { InvoiceStatusBadge } from '@/components/shared/invoice-status-badge';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useClientsAnalytics, useShipments } from '@/lib/hooks';
import { formatDateShort } from '@/lib/utils/date';
import { pluralCount } from '@/lib/utils/plural';
import { MoneyStrip } from '@/pages-components/Dashboard/Partners/PartnerDetail';
import { formatEuro } from '@/pages-components/Dashboard/Partners/parts';
import { Icon } from '@/ui';

const NALOZI = ['nalog', 'naloga', 'naloga'] as const;
const RECENT_COUNT = 5;

/** „Koprivnica → München +1”: first utovar → first istovar, + the other istovar places. */
export function routeOf(shipment: Shipment) {
  const from = shipment.cargo[0]?.loadingAddress?.placeName;
  const to = [...new Set(shipment.cargo.map((cargo) => cargo.unloadingAddress?.placeName).filter(Boolean))];
  const route = [from, to[0]].filter(Boolean).join(' → ');
  return to.length > 1 ? `${route} +${to.length - 1}` : route;
}

/** Earliest utovar date (falls back to when the nalog was made). */
export function dateOf(shipment: Shipment) {
  const dates = shipment.cargo
    .map((cargo) => cargo.loadingReadyDate)
    .filter((date): date is string => !!date)
    .sort();
  return formatDateShort(dates[0] ?? shipment.createdAt);
}

/**
 * Money strip of a client (lab /partners `MONEY.client`): unpaid and late as nalog counts (today's getShipments
 * filters; the € amounts need the backend), and this year's total from getClientsAnalytics.
 */
export function ClientMoney({ clientId }: { clientId: string }) {
  const year = dayjs().year();
  const unpaid = useShipments({ params: { clientId, invoiceStatus: InvoiceStatus.Sent, page: 1, size: 1 } });
  const late = useShipments({ params: { clientId, isInvoiceOverdue: 'true', page: 1, size: 1 } });
  const analytics = useClientsAnalytics({ from: `${year}-01-01`, to: dayjs().format('YYYY-MM-DD') });
  const total = analytics.data?.find((item) => String(item.clientId) === clientId);
  const lateCount = late.data?.totalElements ?? 0;

  return (
    <MoneyStrip
      isLoading={unpaid.isLoading || late.isLoading || analytics.isLoading}
      items={[
        {
          label: 'Fakturirano, neplaćeno',
          value: pluralCount(unpaid.data?.totalElements ?? 0, NALOZI),
          detail: 'čeka uplatu',
          error: unpaid.isError && !unpaid.data,
          onRetry: () => void unpaid.refetch(),
        },
        {
          label: 'Kasni s plaćanjem',
          value: pluralCount(lateCount, NALOZI),
          detail: 'prošlo dospijeće',
          tone: lateCount > 0 ? 'text-destructive' : undefined,
          error: late.isError && !late.data,
          onRetry: () => void late.refetch(),
        },
        {
          label: `Ukupno ${year}.`,
          value: formatEuro(total?.totalPrice ?? 0),
          detail: pluralCount(total?.shipmentCount ?? 0, NALOZI),
          error: analytics.isError && !analytics.data,
          onRetry: () => void analytics.refetch(),
        },
      ]}
    />
  );
}

/** The client's latest nalozi (lab /partners „Nalozi” panel) with invoice pills; „Svi nalozi” opens Nalozi filtered. */
export function ClientOrders({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useShipments({ params: { clientId, page: 1, size: RECENT_COUNT } });
  const orders = data?.data ?? [];

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-6 w-full" key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
        Nalozi se nisu učitali.
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </div>
    );
  } else if (orders.length === 0) {
    body = <p className="p-4 text-sm text-muted-foreground">Još nema naloga za ovog klijenta.</p>;
  } else {
    body = (
      <Table>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              className="cursor-pointer"
              key={order.id}
              onClick={() => void router.push(`/dashboard/shipments/${order.id}`)}
            >
              <TableCell className="py-3 pl-4 font-medium tabular-nums">
                <Link
                  className="flex items-center gap-2 outline-none focus-visible:underline"
                  href={`/dashboard/shipments/${order.id}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Icon className="text-muted-foreground" icon="IconFileDescription" size="s" /> {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="py-3 text-muted-foreground">{routeOf(order)}</TableCell>
              <TableCell className="py-3 text-muted-foreground tabular-nums">{dateOf(order)}</TableCell>
              <TableCell className="py-3 text-right tabular-nums">{formatEuro(order.price ?? 0)}</TableCell>
              <TableCell className="py-3 pr-4 text-right">
                <InvoiceStatusBadge isOverdue={order.isInvoiceOverdue} status={order.invoiceStatus} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Panel
      action={
        <Button
          nativeButton={false}
          render={<Link href={`/dashboard/shipments?clientId=${encodeURIComponent(clientId)}`} />}
          size="sm"
          variant="ghost"
        >
          Svi nalozi <Icon data-icon="inline-end" icon="IconExternalLink" size="s" />
        </Button>
      }
      bodyClassName="p-0"
      title="Nalozi"
    >
      {body}
    </Panel>
  );
}
