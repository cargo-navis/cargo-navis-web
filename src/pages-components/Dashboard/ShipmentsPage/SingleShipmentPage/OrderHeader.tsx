/**
 * Nalog header (lab /order parts.tsx OrderHeader, compact): ← Nalozi, the number (Sora) + violet „Agencijski”, client ·
 * Ref. klijenta · Podvozar · Kreirao; actions: Obavijesti vozača / Dodijeli vozilo (own nalozi; today's flows),
 * Preuzmi PDF ▾ (per document, HR / EN), Uredi (primary), ⋯ (Kopiraj nalog, Obriši nalog → AlertDialog).
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { Icon } from '@/ui';

import {
  copyShipmentHref,
  DeleteShipmentDialog,
  editShipmentHref,
  getPdfDocuments,
  PDF_LANGUAGES,
  useDownloadShipmentPdf,
} from '../shared/actions';
import { useLookups } from '../shared/lookups';
import { useNotifyDrivers } from '../shared/notifyDrivers';

/**
 * Today's NotifyDriversButton (logic in shared/notifyDrivers): notifies the drivers of the unfinished stops; asks first
 * when they were notified. `compact` (the quick look's Vozač row): small „Obavijesti”, hidden without a driver.
 */
export function NotifyDriversButton({
  shipment,
  clientName,
  compact = false,
}: {
  shipment: Shipment;
  clientName?: string;
  compact?: boolean;
}) {
  const drivers = useNotifyDrivers(shipment, clientName, compact ? 'quick_look' : 'detail');
  if (!drivers.hasStops || (compact && drivers.driverCount === 0)) return null;
  const { driverCount, lastSentAt } = drivers;

  return (
    <>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button
            disabled={driverCount === 0}
            loading={drivers.isPending}
            size={compact ? 'sm' : 'default'}
            variant="outline"
            onClick={drivers.request}
          >
            <Icon data-icon="inline-start" icon="IconBell" size="s" />{' '}
            {lastSentAt ? 'Obavijesti ponovno' : compact ? 'Obavijesti' : drivers.label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {driverCount === 0
            ? 'Vozilo nema dodijeljenog vozača.'
            : lastSentAt
              ? `Poslano ${formatDateTime(lastSentAt, { short: true })}`
              : 'Pošalji vozaču utovare i istovare ovog naloga.'}
        </TooltipContent>
      </Tooltip>
      {drivers.dialog}
    </>
  );
}

function PdfMenu({
  shipment,
  clientName,
  contractorName,
}: {
  shipment: Shipment;
  clientName?: string;
  contractorName?: string;
}) {
  const { download, isDownloading } = useDownloadShipmentPdf();
  const documents = getPdfDocuments(shipment, { clientName, contractorName });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button loading={isDownloading} variant="outline" />}>
        <Icon data-icon="inline-start" icon="IconDownload" size="s" /> Preuzmi PDF
        <Icon data-icon="inline-end" icon="IconChevronDown" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {documents.map((document, index) => (
          <React.Fragment key={document.label}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">
                {document.label}
                {document.recipientName && (
                  <span className="font-normal text-muted-foreground"> · {document.recipientName}</span>
                )}
              </DropdownMenuLabel>
              {PDF_LANGUAGES.map((language) => (
                <DropdownMenuItem key={language.value} onClick={() => void download(document, language.value)}>
                  <CountryFlag code={language.flagCode} size="xs" /> {language.text}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OrderHeader({ shipment, onAssignClick }: { shipment: Shipment; onAssignClick(): void }) {
  const router = useRouter();
  const { clientsById, contractorsById, employeesById } = useLookups();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
  const contractor =
    shipment.isAgency && shipment.transportContractorId
      ? contractorsById.get(shipment.transportContractorId)
      : undefined;
  const createdBy = shipment.createdById ? employeesById.get(shipment.createdById)?.fullName : undefined;
  const isAssigned = (shipment.vehicleStops?.length ?? 0) > 0;

  return (
    <header className="flex flex-col gap-3">
      <Link
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        href="/dashboard/shipments"
      >
        <Icon icon="IconArrowLeft" size="s" /> Nalozi
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold tracking-tight tabular-nums">{shipment.orderNumber}</h1>
            {shipment.isAgency && (
              <Badge tone="category">
                <Icon icon={ENTITY_ICON.agency} size="xs" /> Agencijski
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {client ? (
              <Link
                className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
                href={`/dashboard/clients/${client.id}`}
              >
                <Icon className="text-muted-foreground" icon={ENTITY_ICON.client} size="s" /> {client.name}
              </Link>
            ) : (
              <span>—</span>
            )}
            {shipment.externalOrderReference && <span>Ref. klijenta {shipment.externalOrderReference}</span>}
            {contractor && (
              <span className="flex items-center gap-1.5">
                · Podvozar
                <Link
                  className="font-medium text-foreground hover:underline"
                  href={`/dashboard/contractors/${contractor.id}`}
                >
                  {contractor.name}
                </Link>
              </span>
            )}
            <span>
              · Kreirao {createdBy ?? '—'}, {formatDate(shipment.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!shipment.isAgency &&
            (isAssigned ? (
              <NotifyDriversButton clientName={client?.name} shipment={shipment} />
            ) : (
              <Button variant="outline" onClick={onAssignClick}>
                <Icon data-icon="inline-start" icon="IconTruck" size="s" /> Dodijeli vozilo
              </Button>
            ))}
          <PdfMenu clientName={client?.name} contractorName={contractor?.name} shipment={shipment} />
          <Button onClick={() => void router.push(editShipmentHref(shipment.id))}>
            <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button aria-label="Više akcija" size="icon" variant="outline" />}>
              <Icon icon="IconDots" size="s" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => void router.push(copyShipmentHref(shipment.id))}>
                <Icon icon="IconCopy" size="s" /> Kopiraj nalog
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Icon icon="IconTrash" size="s" /> Obriši nalog
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {deleteOpen && (
        <DeleteShipmentDialog
          clientName={client?.name}
          open={deleteOpen}
          shipment={shipment}
          onDeleted={() => void router.push('/dashboard/shipments')}
          onOpenChange={setDeleteOpen}
        />
      )}
    </header>
  );
}
