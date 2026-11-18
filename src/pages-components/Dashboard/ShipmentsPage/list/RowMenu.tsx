/**
 * ⋯ row menu of the Nalozi table and the same menu on right-click (lab /tables row-menu.tsx, decided on
 * /overlays/menus): Otvori (+ „Otvori u novoj kartici” on right-click), Uredi, Kopiraj nalog, Preuzmi PDF ▸ (per
 * document, HR / EN), Status fakture ▸, Izbriši (AlertDialog). Vehicle / driver are assigned in their own cell.
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
import type { Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
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
import { INVOICE_STATUS_LABEL, INVOICE_STATUSES } from '../shared/invoice';
import { useLookups } from '../shared/lookups';

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

function MenuItems({
  parts: M,
  shipment,
  onAskDelete,
  inContext,
}: {
  parts: typeof DROPDOWN;
  shipment: Shipment;
  onAskDelete(): void;
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
          <M.Item onClick={() => window.open(shipmentHref(shipment.id), '_blank', 'noopener')}>
            <MenuIcon icon="IconExternalLink" /> Otvori u novoj kartici
          </M.Item>
        )}
        <M.Item onClick={() => void router.push(editShipmentHref(shipment.id))}>
          <MenuIcon icon="IconPencil" /> Uredi
        </M.Item>
        <M.Item onClick={() => void router.push(copyShipmentHref(shipment.id))}>
          <MenuIcon icon="IconCopy" /> Kopiraj nalog
        </M.Item>
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
      </M.Group>

      <M.Separator />

      <M.Item variant="destructive" onClick={onAskDelete}>
        <MenuIcon icon="IconTrash" /> Izbriši nalog
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

export function RowMenu({ shipment }: { shipment: Shipment }) {
  const confirm = useDeleteConfirm(shipment);
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
          <MenuItems parts={DROPDOWN} shipment={shipment} onAskDelete={confirm.ask} />
        </DropdownMenuContent>
      </DropdownMenu>
      {confirm.dialog}
    </div>
  );
}

/** Right-click anywhere on the row: the same menu, plus „Otvori u novoj kartici”. `children` is the row (`<tr>`). */
export function RowContextMenu({ shipment, children }: { shipment: Shipment; children: React.ReactElement }) {
  const confirm = useDeleteConfirm(shipment);
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children} />
        <ContextMenuContent className="w-60">
          <MenuItems inContext parts={CONTEXT} shipment={shipment} onAskDelete={confirm.ask} />
        </ContextMenuContent>
      </ContextMenu>
      {confirm.dialog}
    </>
  );
}
