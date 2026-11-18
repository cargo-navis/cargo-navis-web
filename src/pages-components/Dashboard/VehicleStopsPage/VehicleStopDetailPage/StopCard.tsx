import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND } from '@/components/shared/stop-kind';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { StopKinds } from '../StopLine';
import { companyOf, isDone, kindsOf, kindWord, placeOnly, placeWithPostalCode, shipmentsOf } from '../stops';
import { StopDateButton } from './StopDateButton';
import { StopFiles, useStopFileUpload } from './StopFiles';
import { useStopActions } from './useStopActions';

export interface StopCardHandlers {
  onEdit(stop: VehicleStop): void;
  onInsert(stop: VehicleStop, where: 'before' | 'after'): void;
  onDelete(stop: VehicleStop): void;
  onChangeDriverFrom(stop: VehicleStop): void;
}

/** The round marker on the line: the kind's icon in its colour, ✓ when finished, dashed without a date. */
function StopMarker({ stop, isNext }: { stop: VehicleStop; isNext: boolean }) {
  const done = isDone(stop);
  const kind = kindsOf(stop)[0];
  return (
    <span
      className={cn(
        'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card',
        done || !kind ? 'text-muted-foreground' : STOP_KIND[kind].text,
        isNext && 'border-2 border-current',
        !stop.date && !done && 'border-dashed'
      )}
    >
      <Icon icon={done ? 'IconCheck' : kind ? STOP_KIND[kind].icon : 'IconMapPin'} size="s" />
    </span>
  );
}

/**
 * One utovar / istovar on the Ruta (DECISIONS §5 Prijevozi, lab /transports `StopCard`): date (click = inline edit),
 * UTOVAR / ISTOVAR in colour, „Sljedeće” + „Završeno” on the next one, place · company, street, tereti per nalog,
 * 📎 documents, notification state, ⋯ menu; drag handle on hover (the backend only allows moves within the same date).
 */
export function StopCard({
  stop,
  isNext,
  highlighted,
  last,
  driverName,
  clientName,
  handlers,
}: {
  stop: VehicleStop;
  isNext: boolean;
  highlighted: boolean;
  last: boolean;
  driverName(id: string | null): string | undefined;
  clientName(id: string | null): string | undefined;
  handlers: StopCardHandlers;
}) {
  const done = isDone(stop);
  const driver = driverName(stop.driverId);
  const { toggleDone, notifyDriver, isToggling, isNotifying } = useStopActions(stop, driver);
  const files = useStopFileUpload(stop.id);
  // Opened from a link to this stop (e.g. a notification about a new document): show its files.
  const [showFiles, setShowFiles] = React.useState(highlighted);
  const [confirmNotify, setConfirmNotify] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
    disabled: done,
  });
  const company = companyOf(stop);
  const shipments = shipmentsOf(stop);
  const documents = stop.documents ?? [];

  const notify = () => (stop.messageSentAt ? setConfirmNotify(true) : void notifyDriver());

  return (
    <li
      className={cn('group/stop relative flex gap-3', isDragging && 'opacity-40')}
      data-stop-id={stop.id}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className="flex flex-col items-center">
        <StopMarker isNext={isNext} stop={stop} />
        {!last && <span className="w-px grow bg-border" />}
      </span>
      <div
        className={cn(
          'relative mb-3 flex min-w-0 flex-1 flex-col gap-2 rounded-xl border bg-card p-4',
          isNext && 'ring-1 ring-primary/40',
          highlighted && 'ring-2 ring-primary',
          done && 'bg-muted/30'
        )}
      >
        {!done && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  aria-label="Premjesti"
                  className="absolute top-4 -left-7 hidden cursor-grab touch-none text-muted-foreground group-hover/stop:inline-flex active:cursor-grabbing pointer-coarse:inline-flex"
                  type="button"
                  {...attributes}
                  {...listeners}
                />
              }
            >
              <Icon icon="IconGripVertical" size="s" />
            </TooltipTrigger>
            <TooltipContent>Povuci za premještanje (unutar istog datuma)</TooltipContent>
          </Tooltip>
        )}
        <div className="flex items-start justify-between gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <StopDateButton stop={stop} />
            <StopKinds muted={done} stop={stop} />
            {isNext && (
              <Badge size="sm" tone="brand">
                Sljedeće
              </Badge>
            )}
            {done && (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Badge look="dot" size="sm" tone="success">
                    Završeno
                  </Badge>
                </TooltipTrigger>
                {stop.completedAt && <TooltipContent>Završeno {formatDateTime(stop.completedAt)}</TooltipContent>}
              </Tooltip>
            )}
          </span>
          <span className="flex items-center gap-1">
            {!done && isNext && (
              <Button loading={isToggling} size="sm" variant="outline" onClick={() => void toggleDone()}>
                <Icon data-icon="inline-start" icon="IconCheck" size="s" /> Završeno
              </Button>
            )}
            <StopMenu
              stop={stop}
              onChangeDriverFrom={() => handlers.onChangeDriverFrom(stop)}
              onDelete={() => handlers.onDelete(stop)}
              onEdit={() => handlers.onEdit(stop)}
              onInsert={(where) => handlers.onInsert(stop, where)}
              onNotify={notify}
              onToggleDone={() => void toggleDone()}
            />
          </span>
        </div>
        <div className="flex min-w-0 flex-col text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
            <span className="font-medium">{placeWithPostalCode(stop)}</span>
            {company && <span className="truncate text-muted-foreground">· {company}</span>}
          </span>
          {stop.address?.streetName && <span className="text-xs text-muted-foreground">{stop.address.streetName}</span>}
        </div>
        {shipments.length > 0 && (
          <ul className="flex flex-col gap-0.5 text-sm">
            {shipments.map(({ shipment, cargo }) => (
              <li className="flex flex-wrap gap-x-1.5" key={shipment.id}>
                <Link className="font-medium tabular-nums hover:underline" href={`/dashboard/shipments/${shipment.id}`}>
                  #{shipment.orderNumber}
                </Link>
                <span className="text-muted-foreground">
                  {[clientName(shipment.clientId), cargo].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <button
            aria-expanded={documents.length > 0 ? showFiles : undefined}
            className="flex items-center gap-1 hover:text-foreground"
            disabled={files.isUploading}
            type="button"
            onClick={() => (documents.length > 0 ? setShowFiles((open) => !open) : files.pick())}
          >
            <Icon className="size-3.5! [&_svg]:size-full!" icon="IconPaperclip" size="xs" />
            {documents.length > 0 ? documents.length : files.isUploading ? 'Dodajem…' : 'Dodaj dokument'}
          </button>
          {!done &&
            stop.driverId &&
            (stop.messageSentAt ? (
              <span className="flex items-center gap-1">
                <Icon className="size-3.5! [&_svg]:size-full!" icon="IconBellRinging" size="xs" /> Obaviješten{' '}
                {formatDateTime(stop.messageSentAt, { short: true })}
              </span>
            ) : (
              <button
                className="flex items-center gap-1 text-warning hover:underline disabled:opacity-60"
                disabled={isNotifying}
                type="button"
                onClick={() => void notifyDriver()}
              >
                <Icon className="size-3.5! [&_svg]:size-full!" icon="IconBellRinging" size="xs" /> Nije obaviješten ·
                Obavijesti
              </button>
            ))}
        </div>
        {showFiles && documents.length > 0 && (
          <StopFiles isUploading={files.isUploading} stop={stop} onAdd={files.pick} />
        )}
        {files.input}
      </div>
      <AlertDialog open={confirmNotify} onOpenChange={setConfirmNotify}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Obavijestiti ponovno?</AlertDialogTitle>
            <AlertDialogDescription>
              {driver ?? 'Vozač'} je već obaviješten
              {stop.messageSentAt ? ` ${formatDateTime(stop.messageSentAt, { short: true })}` : ''}. Poslati obavijest
              ponovno?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmNotify(false);
                void notifyDriver();
              }}
            >
              <Icon data-icon="inline-start" icon="IconBellRinging" size="s" /> Obavijesti ponovno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function StopMenu({
  stop,
  onEdit,
  onInsert,
  onNotify,
  onToggleDone,
  onDelete,
  onChangeDriverFrom,
}: {
  stop: VehicleStop;
  onEdit(): void;
  onInsert(where: 'before' | 'after'): void;
  onNotify(): void;
  onToggleDone(): void;
  onDelete(): void;
  onChangeDriverFrom(): void;
}) {
  const done = isDone(stop);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label={`Akcije: ${kindWord(stop)} ${placeOnly(stop)}`} size="icon-sm" variant="ghost" />}
      >
        <Icon icon="IconDots" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onClick={onEdit}>
          <Icon icon="IconPencil" size="s" /> Uredi
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onInsert('before')}>
          <Icon icon="IconPlus" size="s" /> Dodaj prije
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onInsert('after')}>
          <Icon icon="IconPlus" size="s" /> Dodaj poslije
        </DropdownMenuItem>
        {stop.driverId && !done && (
          <DropdownMenuItem onClick={onNotify}>
            <Icon icon="IconBellRinging" size="s" /> {stop.messageSentAt ? 'Obavijesti ponovno' : 'Obavijesti vozača'}
          </DropdownMenuItem>
        )}
        {!done && (
          <DropdownMenuItem onClick={onChangeDriverFrom}>
            <Icon icon="IconUserShare" size="s" /> Promijeni vozača od ovdje
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onToggleDone}>
          <Icon icon={done ? 'IconRotate2' : 'IconCheck'} size="s" /> {done ? 'Poništi završeno' : 'Označi završenim'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Icon icon="IconTrash" size="s" /> Obriši
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
