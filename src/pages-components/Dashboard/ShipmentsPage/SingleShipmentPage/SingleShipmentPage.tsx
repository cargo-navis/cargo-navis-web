/**
 * Nalog detail (DECISIONS §5 „Nalog detail”): header, summary strip, tabs Pregled / Dokumenti / Napomene (tab in the
 * URL). Pregled is lab /order-route option A „Ruta kao glavni sadržaj” (decided 2026-11-19): the wide main column is
 * the Ruta (agency: Relacija) as a status timeline with the Tereti cards below it; the narrow right column Faktura,
 * Vozilo i vozač / Podvozar, email recipients (KAN-112) and Napomene. Below xl the right column stacks under the
 * main one. Povijest is left out: the API has no log.
 */

import { useRouter } from 'next/router';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { EntityNotFound, isNotFoundError } from '@/components/shared/not-found';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { track } from '@/lib/analytics';
import type { Shipment } from '@/lib/api';
import { useShipment } from '@/lib/hooks';
import { Icon } from '@/ui';

import { assignVehicleHref } from '../shared/actions';
import { ShipmentLookupsProvider, useShipmentLookups } from '../shared/lookups';
import { CargoCards } from './CargoCards';
import { documentsOf, DocumentsTab } from './DocumentsTab';
import { NotesTab } from './NotesTab';
import { OrderHeader } from './OrderHeader';
import { AssignmentPanel, InvoicePanel, RecipientsPanel } from './panels';
import { RouteSection } from './RouteSection';
import { SummaryStrip } from './SummaryStrip';

const TABS = ['pregled', 'dokumenti', 'napomene'] as const;
type Tab = (typeof TABS)[number];

function useDetailTab() {
  const router = useRouter();
  const tab: Tab = TABS.includes(router.query.tab as Tab) ? (router.query.tab as Tab) : 'pregled';
  const setTab = (next: Tab) => {
    track('nalog tab opened', { tab: next });
    const query = { ...router.query };
    if (next === 'pregled') delete query.tab;
    else query.tab = next;
    void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
  };
  return { tab, setTab };
}

export const SingleShipmentPage = () => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : undefined;
  const { data: shipment, error, isLoading, isError, refetch, isFetching } = useShipment(id);
  const lookups = useShipmentLookups();

  return (
    <ShipmentLookupsProvider value={lookups}>
      <DashboardLayout breadcrumbs={[CRUMBS.shipments, { label: shipment?.orderNumber ?? 'Nalog' }]}>
        <PageTitle title={shipment?.orderNumber} type="Nalog" />
        {shipment ? (
          <MainContent shipment={shipment} />
        ) : isNotFoundError(error) ? (
          <EntityNotFound kind="shipment" />
        ) : isError && !isLoading ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="danger">
                <Icon icon="IconAlertOctagon" size="m" />
              </EmptyMedia>
              <EmptyTitle>Nalog se nije učitao</EmptyTitle>
              <EmptyDescription>Možda je obrisan, ili je problem kod nas. Pokušaj ponovno.</EmptyDescription>
            </EmptyHeader>
            <Button loading={isFetching} variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          </Empty>
        ) : (
          <PageSkeleton />
        )}
      </DashboardLayout>
    </ShipmentLookupsProvider>
  );
};

function MainContent({ shipment }: { shipment: Shipment }) {
  const { push } = useRouter();
  const { tab, setTab } = useDetailTab();
  const openAssign = () => void push(assignVehicleHref(shipment.id));
  const documentsCount = documentsOf(shipment).length;
  // Interna + Vanjska: how many are written (0–2).
  const notesCount = [shipment.internalNote, shipment.isAgency ? shipment.externalNote : undefined].filter((note) =>
    note?.trim()
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <OrderHeader shipment={shipment} onAssignClick={openAssign} />
      <SummaryStrip shipment={shipment} />
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList variant="line">
          <TabsTrigger value="pregled">Pregled</TabsTrigger>
          <TabsTrigger value="dokumenti">
            Dokumenti
            {documentsCount > 0 && (
              <Badge className="tabular-nums" size="sm">
                {documentsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="napomene">
            {/* An own nalog has the one note (NotesTab). */}
            {shipment.isAgency ? 'Napomene' : 'Napomena'}
            {notesCount > 0 && (
              <Badge className="tabular-nums" size="sm">
                {notesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent className="pt-5" value="pregled">
          {/* Side column 30% (at least 360px), so the Ruta doesn't stretch across wide screens (2026-11-23). */}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,30%)]">
            <div className="flex min-w-0 flex-col gap-8">
              <RouteSection shipment={shipment} />
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-base font-bold tracking-tight">Tereti</h2>
                <CargoCards shipment={shipment} />
              </section>
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              <InvoicePanel shipment={shipment} />
              <AssignmentPanel shipment={shipment} onAssignClick={openAssign} />
              <RecipientsPanel shipment={shipment} />
              <NotesTab shipment={shipment} />
            </div>
          </div>
        </TabsContent>
        <TabsContent className="max-w-2xl pt-5" value="dokumenti">
          <DocumentsTab shipment={shipment} />
        </TabsContent>
        <TabsContent className="max-w-2xl pt-5" value="napomene">
          <NotesTab shipment={shipment} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** First load: the page's shape (header, strip, tabs, Ruta + side column). */
function PageSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
      <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="flex flex-col gap-2 bg-card px-4 py-3" key={index}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,30%)]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-32 rounded-xl" key={index} />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
