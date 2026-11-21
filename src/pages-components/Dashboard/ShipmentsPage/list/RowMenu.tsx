/**
 * ⋯ row menu of the Nalozi table and the same menu on right-click (lab /tables row-menu.tsx, decided on
 * /overlays/menus): Otvori (+ „Otvori u novom tabu” on right-click), Uredi, Kopiraj nalog, Obavijesti vozača (own
 * nalozi with a driver and unfinished stops; shared/notifyDrivers), Preuzmi PDF ▸ (per document, HR / EN), Status
 * fakture ▸, Obriši (AlertDialog). Vehicle / driver are assigned in their own cell.
 * Agency nalozi also get „Status tereta ▸” (lab /quick-look note): the hand-set teret status, per teret (T1, T2 … with
 * its places) or, with one teret, the three states directly — the same save as the Nalog detail (shared/cargoStatus).
 */

import { useRouter } from 'next/router';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Cargo, Shipment } from '@/lib/api';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { Icon } from '@/ui';

import {
  copyShipmentHref,
  DeleteShipmentDialog,
  editShipmentHref,
  getPdfDocuments,
  PDF_LANGUAGES,
  shipmentHref,
  useChangeInvoiceStatus,
  useDownloadShipmentPdf,
} from '../shared/actions';
import { AGENCY_STATUS_LABEL, LOAD_STATUSES } from '../shared/cargo';
import { type CargoStatusChange, useSetCargoStatus } from '../shared/cargoStatus';
import { INVOICE_STATUS_LABEL, INVOICE_STATUSES } from '../shared/invoice';
import { useLookups } from '../shared/lookups';
import { useNotifyDrivers } from '../shared/notifyDrivers';

// Dropdown and context menu are different primitives with the same parts; one list of parts keeps them in sync.
const DROPDOWN = {
  Group: DropdownMenuGroup,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Sub: DropdownMenuSub,
  SubContent: DropdownMenuSubContent,
  SubTrigger: DropdownMenuSubTrigger,
};
const CONTEXT = {
  Group: ContextMenuGroup,
  Item: ContextMenuItem,
  Label: ContextMenuLabel,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Separator: ContextMenuSeparator,
  Sub: ContextMenuSub,
  SubContent: ContextMenuSubContent,
  SubTrigger: ContextMenuSubTrigger,
} as unknown as typeof DROPDOWN;

function MenuIcon({ icon }: { icon: React.ComponentProps<typeof Icon>['icon'] }) {
  return <Icon icon={icon} size="s" />;
}

const statusOf = (cargo: Cargo) => cargo.loadStatus ?? LoadStatus.NotYetLoaded;

/** „Zagreb → Graz” */
const cargoPlaces = (cargo: Cargo) =>
  `${cargo.loadingAddress?.placeName || '—'} → ${cargo.unloadingAddress?.placeName || '—'}`;

function CargoStatusRadios({
  parts: M,
  cargo,
  onChange,
}: {
  parts: typeof DROPDOWN;
  cargo: Cargo;
  onChange(change: CargoStatusChange): void;
}) {
  return (
    <M.RadioGroup
      value={statusOf(cargo)}
      onValueChange={(value: unknown) => onChange({ cargoId: cargo.id, status: value as LoadStatus })}
    >
      {LOAD_STATUSES.map((status) => (
        <M.RadioItem key={status} value={status}>
          {AGENCY_STATUS_LABEL[status]}
        </M.RadioItem>
      ))}
    </M.RadioGroup>
  );
}

/** Agency: „Status tereta ▸” — one teret: the three states; several: a submenu per teret. */
function CargoStatusSub({ parts: M, shipment }: { parts: typeof DROPDOWN; shipment: Shipment }) {
  const { set } = useSetCargoStatus(shipment);
  const onChange = (change: CargoStatusChange) => void set([change]);
  const [single] = shipment.cargo;
  return (
    <M.Sub>
      <M.SubTrigger>
        <MenuIcon icon="IconPackage" /> Status tereta
        {shipment.cargo.length === 1 && (
          <span className="ml-auto text-xs text-muted-foreground">{AGENCY_STATUS_LABEL[statusOf(single)]}</span>
        )}
      </M.SubTrigger>
      <M.SubContent className={shipment.cargo.length === 1 ? 'w-48' : 'w-64'}>
        <M.Group>
          <M.Label>Status tereta (ručno)</M.Label>
          {shipment.cargo.length === 1 ? (
            <CargoStatusRadios cargo={single} parts={M} onChange={onChange} />
          ) : (
            shipment.cargo.map((cargo, index) => (
              <M.Sub key={cargo.id}>
                <M.SubTrigger>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">
                      T{index + 1} · {cargoPlaces(cargo)}
                    </span>
                    <span className="text-xs text-muted-foreground">{AGENCY_STATUS_LABEL[statusOf(cargo)]}</span>
                  </span>
                </M.SubTrigger>
                <M.SubContent className="w-48">
                  <CargoStatusRadios cargo={cargo} parts={M} onChange={onChange} />
                </M.SubContent>
              </M.Sub>
            ))
          )}
        </M.Group>
      </M.SubContent>
    </M.Sub>
  );
}

function MenuItems({
  parts: M,
  shipment,
  onAskDelete,
  notify,
  inContext,
}: {
  parts: typeof DROPDOWN;
  shipment: Shipment;
  onAskDelete(): void;
  notify: ReturnType<typeof useNotifyDrivers>;
  inContext?: boolean;
}) {
  const router = useRouter();
  const { clientsById, contractorsById } = useLookups();
  const { change } = useChangeInvoiceStatus();
  const { download } = useDownloadShipmentPdf();

  const clientName = shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined;
  const contractorName = shipment.transportContractorId
    ? contractorsById.get(shipment.transportContractorId)?.name
    : undefined;
  const pdfDocuments = getPdfDocuments(shipment, { clientName, contractorName });

  return (
    <>
      <M.Group>
        <M.Label className="truncate">
          #{shipment.orderNumber}
          {clientName && ` · ${clientName}`}
        </M.Label>
        <M.Item onClick={() => void router.push(shipmentHref(shipment.id))}>
          <MenuIcon icon="IconExternalLink" /> Otvori
        </M.Item>
        {inContext && (
          <M.Item render={<a href={shipmentHref(shipment.id)} rel="noopener noreferrer" target="_blank" />}>
            <MenuIcon icon="IconExternalLink" /> Otvori u novom tabu
          </M.Item>
        )}
        <M.Item onClick={() => void router.push(editShipmentHref(shipment.id))}>
          <MenuIcon icon="IconPencil" /> Uredi
        </M.Item>
        <M.Item onClick={() => void router.push(copyShipmentHref(shipment.id))}>
          <MenuIcon icon="IconCopy" /> Kopiraj nalog
        </M.Item>
        {notify.hasStops && notify.driverCount > 0 && (
          // „Obavijesti vozača [ponovno]” with who gets it underneath.
          <M.Item className="items-start" disabled={notify.isPending} onClick={notify.request}>
            <span className="mt-0.5 flex">
              <MenuIcon icon="IconBell" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span>{notify.lastSentAt ? `${notify.label} ponovno` : notify.label}</span>
              {notify.driverNames.length > 0 && (
                <span className="truncate text-xs text-muted-foreground">{notify.driverNames.join(', ')}</span>
              )}
            </span>
          </M.Item>
        )}
      </M.Group>

      <M.Separator />

      <M.Group>
        <M.Sub>
          <M.SubTrigger>
            <MenuIcon icon="IconDownload" /> Preuzmi PDF
          </M.SubTrigger>
          <M.SubContent className="w-64">
            {pdfDocuments.map((document, index) => (
              <React.Fragment key={document.label}>
                {index > 0 && <M.Separator />}
                <M.Group>
                  <M.Label className="truncate">
                    {document.label}
                    {document.recipientName && (
                      <span className="font-normal text-muted-foreground"> · {document.recipientName}</span>
                    )}
                  </M.Label>
                  {PDF_LANGUAGES.map((language) => (
                    <M.Item key={language.value} onClick={() => void download(document, language.value)}>
                      <CountryFlag code={language.flagCode} size="xs" /> {language.text}
                    </M.Item>
                  ))}
                </M.Group>
              </React.Fragment>
            ))}
          </M.SubContent>
        </M.Sub>

        <M.Sub>
          <M.SubTrigger>
            <MenuIcon icon="IconReceipt" /> Status fakture
            <span className="ml-auto text-xs text-muted-foreground">
              {INVOICE_STATUS_LABEL[shipment.invoiceStatus]}
            </span>
          </M.SubTrigger>
          <M.SubContent className="w-48">
            <M.RadioGroup
              value={shipment.invoiceStatus}
              onValueChange={(value: unknown) => void change(shipment, value as InvoiceStatus)}
            >
              {INVOICE_STATUSES.map((status) => (
                <M.RadioItem key={status} value={status}>
                  {INVOICE_STATUS_LABEL[status]}
                </M.RadioItem>
              ))}
            </M.RadioGroup>
          </M.SubContent>
        </M.Sub>

        {shipment.isAgency && shipment.cargo.length > 0 && <CargoStatusSub parts={M} shipment={shipment} />}
      </M.Group>

      <M.Separator />

      <M.Item variant="destructive" onClick={onAskDelete}>
        <MenuIcon icon="IconTrash" /> Obriši nalog
      </M.Item>
    </>
  );
}

function useDeleteConfirm(shipment: Shipment) {
  const { clientsById } = useLookups();
  const [open, setOpen] = React.useState(false);
  const clientName = shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined;
  // Mounted only while asked: it holds this nalog's delete mutations.
  const dialog = open ? (
    <DeleteShipmentDialog clientName={clientName} open={open} shipment={shipment} onOpenChange={setOpen} />
  ) : null;
  return { ask: () => setOpen(true), dialog };
}

/** The row's client name, for the notify toast („… o nalogu za Kraš”). */
function useClientName(shipment: Shipment) {
  const { clientsById } = useLookups();
  return shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined;
}

export function RowMenu({ shipment }: { shipment: Shipment }) {
  const confirm = useDeleteConfirm(shipment);
  const notify = useNotifyDrivers(shipment, useClientName(shipment));
  return (
    // The row opens the nalog on click; nothing in here should.
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button aria-label={`Akcije za nalog ${shipment.orderNumber}`} size="icon-sm" variant="ghost" />}
        >
          <Icon icon="IconDots" size="s" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <MenuItems notify={notify} parts={DROPDOWN} shipment={shipment} onAskDelete={confirm.ask} />
        </DropdownMenuContent>
      </DropdownMenu>
      {confirm.dialog}
      {notify.dialog}
    </div>
  );
}

/** Right-click anywhere on the row: the same menu, plus „Otvori u novom tabu”. `children` is the row (`<tr>`). */
export function RowContextMenu({ shipment, children }: { shipment: Shipment; children: React.ReactElement }) {
  const confirm = useDeleteConfirm(shipment);
  const notify = useNotifyDrivers(shipment, useClientName(shipment));
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent className="w-60">
          <MenuItems inContext notify={notify} parts={CONTEXT} shipment={shipment} onAskDelete={confirm.ask} />
        </ContextMenuContent>
      </ContextMenu>
      {confirm.dialog}
      {notify.dialog}
    </>
  );
}
