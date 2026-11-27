/**
 * Quick look at a nalog from the Nalozi list (DECISIONS §3 Sheet, labs /overlays/sheet + /overlays QuickLookSheet):
 * floating md (512) side sheet, `modal={false}` and no backdrop, so the table stays usable. A click on another row
 * switches to that nalog; a click anywhere else (filters, sidebar, empty space) closes it, as do × and Esc. Read + small
 * actions: quick assign, „Obavijesti” (the drivers, as on the Nalog detail), invoice status, „✓ Potvrdi utovar / istovar” on the vehicle's next stop (own nalog with a
 * vehicle, as on the Nalog detail; undo stays there), Uredi and „Otvori nalog” (the full page). Not on phones: the row opens the page.
 * The route is last, under the data rows: utovari / istovari as a vertical timeline by date (RouteStops, lab /quick-look
 * variant A). Agency nalozi (lab „Nalog: Agencijski”): nobody reports, the dispatcher marks each teret by hand — a
 * „Status tereta ▸” per teret in the Teret row, and „Relacija” („Planirano s naloga.”) with a mark button per stop
 * (AgencyRouteStops).
 */

import Link from 'next/link';
import * as React from 'react';

import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { track } from '@/lib/analytics';
import type { Shipment } from '@/lib/api';
import { Icon, type IconType } from '@/ui';

import { editShipmentHref, shipmentHref } from '../shared/actions';
import { cargoQuantity, isOversize } from '../shared/cargo';
import { AgencyStatusBadge, AgencyStatusMenu } from '../shared/cargoStatus';
import { formatEuroExact, getMargin } from '../shared/format';
import { getInvoiceInfo } from '../shared/invoice';
import { InvoiceCell, InvoiceStatusMenu } from '../shared/InvoiceCell';
import { useLookups } from '../shared/lookups';
import { STATUS_TEXT } from '../shared/tones';
import { NotifyDriversButton } from '../SingleShipmentPage/OrderHeader';
import { useAssignment } from './AssignmentCell';
import { CargoCell, MarginPill } from './cells';
import { AgencyRouteStops, RouteStops } from './RouteStops';

// Presses and focus moves that don't close the sheet: the table (`data-quick-look-rows` on ShipmentsTable; a row click
// switches the sheet), toasts (e.g. „Obavijesti” after an assignment), a row's ⋯ / right-click menu and its delete
// confirm.
const KEEPS_OPEN = '[data-quick-look-rows], [data-slot="toast-viewport"], [role="menu"], [role="alertdialog"]';

export function QuickLookSheet({ shipment, onClose }: { shipment: Shipment | undefined; onClose(): void }) {
  // The last nalog stays inside while the sheet animates out.
  const [shown, setShown] = React.useState(shipment);
  if (shipment && shipment !== shown) setShown(shipment);
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <Sheet
      modal={false}
      open={!!shipment}
      onOpenChange={(open, details) => {
        if (open) return;
        if (details.reason === 'outside-press' || details.reason === 'focus-out') {
          const target =
            details.reason === 'focus-out' ? (details.event as FocusEvent).relatedTarget : details.event.target;
          if (target instanceof Element && target.closest(KEEPS_OPEN)) return;
        }
        onClose();
      }}
    >
      {shown && (
        <SheetContent
          // Focus the panel, not its first button (no focus ring or tooltip on open).
          initialFocus={popupRef}
          overlayClassName="hidden"
          ref={popupRef}
          showCloseButton={false}
        >
          <QuickLook shipment={shown} />
        </SheetContent>
      )}
    </Sheet>
  );
}

function DetailRow({ icon, label, children }: { icon: IconType; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3 py-2.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon icon={icon} size="s" /> {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const Missing = () => <span className="text-muted-foreground">—</span>;

/** Agency: each teret's hand-set status („Nije utovaren” / „Označeno: Utovaren”) and its „Status tereta ▸” menu. */
function AgencyCargoStatuses({ shipment }: { shipment: Shipment }) {
  return (
    <div className="mt-2 flex flex-col">
      {shipment.cargo.map((cargo, index) => (
        <div className="flex flex-col gap-1 border-t py-2 last:pb-0" key={cargo.id}>
          <span className="flex min-w-0 items-center gap-2">
            <span className="font-medium">T{index + 1}</span>
            <span className="truncate text-xs text-muted-foreground">{cargoQuantity(cargo)}</span>
          </span>
          <span className="flex flex-wrap items-center justify-between gap-2">
            <AgencyStatusBadge cargo={cargo} size="sm" />
            <AgencyStatusMenu
              align="start"
              cargo={cargo}
              shipment={shipment}
              side="left"
              trigger={<Button className="-my-0.5 text-muted-foreground" size="xs" variant="ghost" />}
            >
              Status tereta <Icon data-icon="inline-end" icon="IconChevronRight" size="xs" />
            </AgencyStatusMenu>
          </span>
        </div>
      ))}
    </div>
  );
}

function QuickLook({ shipment }: { shipment: Shipment }) {
  const { clientsById, isLoading } = useLookups();
  const assignment = useAssignment(shipment);
  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
  const notes = [
    { label: 'Napomena', text: shipment.internalNote },
    { label: 'Napomena za podvozara', text: shipment.externalNote },
  ].filter((note) => !!note.text);
  const margin =
    shipment.isAgency && shipment.contractorPrice !== null && shipment.contractorPrice !== undefined
      ? getMargin(shipment.price ?? 0, shipment.contractorPrice)
      : undefined;

  return (
    <>
      <div className="flex shrink-0 items-start gap-2 border-b px-6 py-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <SheetTitle className="truncate">
            {client?.name ??
              (isLoading && shipment.clientId ? (
                <Skeleton className="my-0.5 h-6 w-48" />
              ) : (
                `Nalog #${shipment.orderNumber}`
              ))}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 tabular-nums">
            #{shipment.orderNumber} · {formatEuroExact(shipment.price ?? 0)}
            {shipment.isAgency && (
              <Badge size="sm" tone="category">
                <Icon icon={ENTITY_ICON.agency} size="xs" /> Agencijski
              </Badge>
            )}
          </SheetDescription>
        </div>
        <SheetClose render={<Button aria-label="Zatvori" size="icon-sm" variant="ghost" />}>
          <Icon icon="IconX" size="s" />
        </SheetClose>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="divide-y text-sm">
          <DetailRow icon="IconPackage" label="Teret">
            <CargoCell shipment={shipment} />
            {shipment.cargo.some(isOversize) && (
              // The ⚠ next to LDM; in the table it's explained in the cell's tooltip, here there's room to say it.
              <span className={`mt-1.5 flex items-start gap-1.5 text-xs ${STATUS_TEXT.oversize}`}>
                <Icon className="mt-px" icon="IconAlertTriangle" size="xs" />
                <span>Izvanredne dimenzije (više od 2,55 × 3 × 13,6 m): potrebna dozvola / pratnja.</span>
              </span>
            )}
            {shipment.isAgency && <AgencyCargoStatuses shipment={shipment} />}
          </DetailRow>
          {assignment.kind === 'contractor' ? (
            <DetailRow icon={ENTITY_ICON.contractor} label="Podvozar">
              <div className="flex flex-col">
                <span className="truncate">{assignment.contractor?.name ?? '—'}</span>
                <span className="text-xs text-muted-foreground">Vozilo i vozača određuje podvozar</span>
              </div>
            </DetailRow>
          ) : (
            <>
              <DetailRow icon="IconTruck" label="Vozilo">
                {assignment.vehicle ? (
                  <span className="truncate">
                    {[assignment.vehicle.registration, assignment.vehicle.brand].filter(Boolean).join(' · ')}
                  </span>
                ) : (
                  assignment.assignVehicle
                )}
              </DetailRow>
              <DetailRow icon="IconUser" label="Vozač">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {assignment.driver?.fullName ?? assignment.assignDriver ?? <Missing />}
                  </span>
                  {/* Same action as the Nalog detail's header: the unfinished stops' drivers, asks again when sent. */}
                  <div className="-my-1 shrink-0">
                    <NotifyDriversButton clientName={client?.name} compact shipment={shipment} />
                  </div>
                </div>
              </DetailRow>
            </>
          )}
          {margin && (
            <DetailRow icon={margin.isLoss ? 'IconTrendingDown' : 'IconTrendingUp'} label="RUC">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <MarginPill earnings={margin.earnings} isLoss={margin.isLoss} percent={margin.percent} />
                <span className="text-xs text-muted-foreground tabular-nums">
                  Cijena podvozara −{formatEuroExact(shipment.contractorPrice ?? 0)}
                </span>
              </div>
            </DetailRow>
          )}
          {notes.length > 0 && (
            <DetailRow icon="IconMessage" label="Napomena">
              <div className="flex flex-col gap-2">
                {notes.map((note) => (
                  <div className="flex flex-col" key={note.label}>
                    <span className="text-xs text-muted-foreground">{note.label}</span>
                    <span className="whitespace-pre-wrap">{note.text}</span>
                  </div>
                ))}
              </div>
            </DetailRow>
          )}
          <DetailRow icon="IconSend" label="Faktura">
            <div className="flex items-start justify-between gap-3">
              <InvoiceCell align="start" amount={shipment.price ?? 0} info={getInvoiceInfo(shipment, client)} />
              <div className="-my-1">
                <InvoiceStatusMenu shipment={shipment} />
              </div>
            </div>
          </DetailRow>
        </div>
        <section className="flex flex-col gap-3 border-t pt-4 pb-1 text-sm">
          {shipment.isAgency ? (
            <>
              <div className="flex flex-col gap-0.5">
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon icon="IconRoute" size="s" /> Relacija
                </h3>
                <p className="text-xs text-muted-foreground">Planirano s naloga.</p>
              </div>
              <AgencyRouteStops shipment={shipment} />
            </>
          ) : (
            <>
              <h3 className="flex items-center gap-1.5 text-muted-foreground">
                <Icon icon="IconRoute" size="s" /> Utovari i istovari
              </h3>
              <RouteStops
                canConfirm={assignment.kind !== 'contractor' && !!assignment.vehicle}
                cargos={shipment.cargo}
                vehicleStops={shipment.vehicleStops}
              />
            </>
          )}
        </section>
      </div>

      <SheetFooter className="flex-row justify-end">
        <Button nativeButton={false} render={<Link href={editShipmentHref(shipment.id)} />} variant="outline">
          <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
        </Button>
        <Button
          nativeButton={false}
          render={
            <Link href={shipmentHref(shipment.id)} onClick={() => track('nalog opened', { entry: 'quick_look' })} />
          }
        >
          <Icon data-icon="inline-start" icon="IconExternalLink" size="s" /> Otvori nalog
        </Button>
      </SheetFooter>
    </>
  );
}
