/**
 * Napomene (lab /order NotesPanel): Interna („Samo za tebe”) and Vanjska („Ispisuje se na PDF nalogu”), each with ✎ or
 * „+ Dodaj napomenu”, edited in a dialog (today's ShipmentNoteModal: max 255 characters, empty = removed).
 */

import * as React from 'react';

import { useDiscardGuard } from '@/components/shared/discard-changes';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Shipment } from '@/lib/api';
import { useUpdateAgencyShipment, useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon, type IconType } from '@/ui';

const NOTE_MAX_LENGTH = 255;

type NoteType = 'internal' | 'external';

const NOTE: Record<NoteType, { title: string; hint: string; icon: IconType; field: 'internalNote' | 'externalNote' }> =
  {
    internal: {
      title: 'Interna',
      hint: 'Samo za tebe. Ne ide na PDF ni drugim primateljima.',
      icon: 'IconLock',
      field: 'internalNote',
    },
    external: {
      title: 'Vanjska',
      hint: 'Ispisuje se na PDF nalogu i u dokumentima za klijenta / podvozara.',
      icon: 'IconEye',
      field: 'externalNote',
    },
  };

function NoteDialog({ shipment, type, onClose }: { shipment: Shipment; type: NoteType; onClose(): void }) {
  const { mutateAsync: updateShipment } = useUpdateShipment();
  const { mutateAsync: updateAgencyShipment } = useUpdateAgencyShipment();
  const config = NOTE[type];
  const saved = shipment[config.field] ?? '';
  const [value, setValue] = React.useState(saved);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const tooLong = value.trim().length > NOTE_MAX_LENGTH;
  const guard = useDiscardGuard({ dirty: value !== saved && !isSaving, onClose });

  async function handleSave() {
    if (tooLong) {
      setShowError(true);
      return;
    }
    setIsSaving(true);
    try {
      const note = value.trim() || null;
      // An agency nalog is patched through its own resource, which carries the note to the contractor's order.
      if (shipment.isAgency) await updateAgencyShipment({ id: shipment.id, [config.field]: note });
      else await updateShipment({ id: shipment.id, [config.field]: note });
      showSuccessToast({ title: 'Napomena ažurirana' });
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Napomena nije spremljena', description: 'Pokušaj ponovno.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && !isSaving && guard.requestClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'internal' ? 'Interna napomena' : 'Vanjska napomena'}</DialogTitle>
            <DialogDescription>{config.hint}</DialogDescription>
          </DialogHeader>
          <Field data-invalid={(showError && tooLong) || undefined}>
            <Textarea
              aria-invalid={(showError && tooLong) || undefined}
              autoFocus
              placeholder="Upiši napomenu…"
              rows={6}
              value={value}
              onBlur={() => setShowError(true)}
              onChange={(event) => setValue(event.target.value)}
            />
            {showError && tooLong ? (
              <FieldError>Najviše {NOTE_MAX_LENGTH} znakova.</FieldError>
            ) : (
              <FieldDescription className="tabular-nums">
                {value.trim().length}/{NOTE_MAX_LENGTH} znakova
              </FieldDescription>
            )}
          </Field>
          <DialogFooter>
            <DialogClose disabled={isSaving} render={<Button variant="ghost" />}>
              Odustani
            </DialogClose>
            <Button loading={isSaving} onClick={() => void handleSave()}>
              <Icon data-icon="inline-start" icon="IconDeviceFloppy" size="s" /> Spremi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guard.discardDialog}
    </>
  );
}

function NoteBlock({ type, note, onEdit }: { type: NoteType; note?: string; onEdit(): void }) {
  const config = NOTE[type];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger render={<span className="flex cursor-default items-center gap-1.5 text-sm font-medium" />}>
            <Icon className="text-muted-foreground" icon={config.icon} size="s" /> {config.title}
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{config.hint}</TooltipContent>
        </Tooltip>
        {note && (
          <Button
            aria-label={`Uredi: ${config.title}`}
            className="ml-auto text-muted-foreground"
            size="icon-xs"
            variant="ghost"
            onClick={onEdit}
          >
            <Icon icon="IconPencil" size="xs" />
          </Button>
        )}
      </div>
      {note ? (
        <p className="text-sm whitespace-pre-wrap">{note}</p>
      ) : (
        <Button className="w-fit text-muted-foreground" size="sm" variant="ghost" onClick={onEdit}>
          <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj napomenu
        </Button>
      )}
    </div>
  );
}

export function NotesTab({ shipment }: { shipment: Shipment }) {
  const [editing, setEditing] = React.useState<NoteType | null>(null);
  return (
    <Panel bodyClassName="flex flex-col gap-4" title="Napomene">
      <NoteBlock note={shipment.internalNote} type="internal" onEdit={() => setEditing('internal')} />
      <div className="h-px bg-border" />
      <NoteBlock note={shipment.externalNote} type="external" onEdit={() => setEditing('external')} />
      {editing && <NoteDialog shipment={shipment} type={editing} onClose={() => setEditing(null)} />}
    </Panel>
  );
}
