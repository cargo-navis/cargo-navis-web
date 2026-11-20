/**
 * Side column of the Nalog page (lab /order-route option A, narrow on the right; Napomene is NotesTab): Faktura (badge +
 * „Promijeni ▾”), Vozilo i vozač / Kontraktor, and the KAN-112 email recipients (today's
 * ShipmentNotificationEmailsModal, new look).
 */

import Link from 'next/link';
import * as React from 'react';

import { DriverAvatar } from '@/components/shared/driver-avatar';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Icon } from '@/ui';

import { MarginPill } from '../list/cells';
import { sortStops } from '../list/routeData';
import { formatEuroExact, getMargin } from '../shared/format';
import { getInvoiceInfo } from '../shared/invoice';
import { InvoiceCell, InvoiceStatusMenu } from '../shared/InvoiceCell';
import { useLookups } from '../shared/lookups';
import { MISSING_BUTTON, TEXT_LINK } from '../shared/tones';
import { RecipientsDialog } from './RecipientsDialog';

export function InvoicePanel({ shipment }: { shipment: Shipment }) {
  const { clientsById } = useLookups();
  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
  const info = getInvoiceInfo(shipment, client);

  return (
    <Panel action={<InvoiceStatusMenu shipment={shipment} />} title="Faktura">
      <div className="flex items-start justify-between gap-3">
        <InvoiceCell align="start" amount={shipment.price ?? 0} info={info} />
        {shipment.invoiceStatusUpdatedAt && (
          <span className="text-right text-xs text-muted-foreground">
            Ažurirano {formatDate(shipment.invoiceStatusUpdatedAt)}
          </span>
        )}
      </div>
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}

/** Agency: the contractor the nalog was passed to; they pick vehicle and driver. Money from today's Financije card. */
function ContractorPanel({ shipment }: { shipment: Shipment }) {
  const { contractorsById } = useLookups();
  const contractor = shipment.transportContractorId ? contractorsById.get(shipment.transportContractorId) : undefined;
  const margin =
    shipment.contractorPrice !== null && shipment.contractorPrice !== undefined
      ? getMargin(shipment.price ?? 0, shipment.contractorPrice)
      : undefined;

  return (
    <Panel title="Kontraktor">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-agency-50 text-agency-700 dark:bg-agency-950 dark:text-agency-300">
            <Icon icon="IconBriefcase" size="m" />
          </span>
          <div className="flex min-w-0 flex-col">
            {contractor ? (
              <Link className="truncate font-medium hover:underline" href={`/dashboard/contractors/${contractor.id}`}>
                {contractor.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
            <span className="text-xs text-muted-foreground">
              Vozilo i vozača određuje kontraktor. Status tereta postavljaš ti.
            </span>
          </div>
        </div>
        <div className="flex flex-col border-t pt-2">
          {shipment.contractorOrderNumber && <Row label="Nalog kontraktoru">#{shipment.contractorOrderNumber}</Row>}
          {shipment.contractorExternalOrderReference && (
            <Row label="Ref. kontraktora">{shipment.contractorExternalOrderReference}</Row>
          )}
          {margin && (
            <>
              <Row label="Cijena kontraktora">
                <span className="tabular-nums">−{formatEuroExact(shipment.contractorPrice ?? 0)}</span>
              </Row>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-sm text-muted-foreground">{margin.isLoss ? 'Gubitak' : 'Zarada'}</span>
                <MarginPill earnings={margin.earnings} isLoss={margin.isLoss} percent={margin.percent} />
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

/** Own: the vehicle(s) and driver(s) on the nalog's stops; „+ Dodijeli vozilo” opens the Dodijeli vozilo page. */
export function AssignmentPanel({ shipment, onAssignClick }: { shipment: Shipment; onAssignClick(): void }) {
  const { vehiclesById, employeesById } = useLookups();
  if (shipment.isAgency) return <ContractorPanel shipment={shipment} />;

  const stops = sortStops(shipment.vehicleStops ?? []);
  if (!stops.length) {
    return (
      <Panel title="Vozilo i vozač">
        <Button className={cn('w-full', MISSING_BUTTON)} variant="outline" onClick={onAssignClick}>
          <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodijeli vozilo
        </Button>
      </Panel>
    );
  }

  // One entry per vehicle + driver pair (a nalog can move between trucks or drivers).
  const pairs = [...new Map(stops.map((stop) => [`${stop.vehicleId}|${stop.driverId ?? ''}`, stop])).values()];

  return (
    <Panel title={pairs.length > 1 ? 'Vozila i vozači' : 'Vozilo i vozač'}>
      <div className="flex flex-col gap-4">
        {pairs.map((pair) => {
          const vehicle = vehiclesById.get(pair.vehicleId);
          const driver = pair.driverId ? employeesById.get(pair.driverId) : undefined;
          const pairStops = stops.filter(
            (stop) => stop.vehicleId === pair.vehicleId && (stop.driverId ?? '') === (pair.driverId ?? '')
          );
          const notifiedAt = pairStops
            .filter((stop) => !isStopCompleted(stop))
            .map((stop) => stop.messageSentAt)
            .filter((sentAt): sentAt is string => !!sentAt)
            .sort()
            .at(-1);
          const hasOpenStops = pairStops.some((stop) => !isStopCompleted(stop));
          return (
            <div className="flex flex-col gap-2.5" key={`${pair.vehicleId}|${pair.driverId ?? ''}`}>
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground">
                  <Icon icon="IconTruck" size="m" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono font-medium">{vehicle?.registration ?? '—'}</span>
                  {vehicle?.brand && <span className="text-xs text-muted-foreground">{vehicle.brand}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DriverAvatar driverId={pair.driverId} name={driver?.fullName} />
                <div className="flex min-w-0 flex-col">
                  <span className={cn('font-medium', !driver && 'text-destructive')}>
                    {driver?.fullName ?? 'Bez vozača'}
                  </span>
                  {driver && hasOpenStops && (
                    <span className="text-xs text-muted-foreground">
                      {notifiedAt
                        ? `Obaviješten ${formatDateTime(notifiedAt, { short: true })}`
                        : 'Još nije obaviješten'}
                    </span>
                  )}
                </div>
              </div>
              <Link
                className={cn('flex w-fit items-center gap-1 text-sm', TEXT_LINK)}
                href={`/dashboard/vehicle-stops/${pair.vehicleId}`}
              >
                Otvori rutu vozila <Icon className="size-3.5! [&_svg]:size-full!" icon="IconExternalLink" size="xs" />
              </Link>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** KAN-112: who gets an email when the cargo is loaded and unloaded. */
export function RecipientsPanel({ shipment }: { shipment: Shipment }) {
  const [open, setOpen] = React.useState(false);
  const emails = shipment.notificationEmails ?? [];
  return (
    <Panel
      action={
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
        </Button>
      }
      title={
        <span className="flex items-center gap-2">
          Emailovi za obavijesti
          <Tooltip>
            <TooltipTrigger render={<span aria-label="Što je ovo?" className="cursor-default text-muted-foreground" />}>
              <Icon icon="IconInfoCircle" size="s" />
            </TooltipTrigger>
            <TooltipContent className="max-w-64">Primaju mail kad se teret utovari i istovari.</TooltipContent>
          </Tooltip>
        </span>
      }
    >
      {emails.length ? (
        <ul className="flex flex-col gap-1">
          {emails.map((email) => (
            <li className="flex items-center gap-2 text-sm" key={email}>
              <Icon className="text-muted-foreground" icon="IconMail" size="s" />
              <span className="truncate" title={email}>
                {email}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nema primatelja.</p>
      )}
      {open && <RecipientsDialog shipment={shipment} onClose={() => setOpen(false)} />}
    </Panel>
  );
}
