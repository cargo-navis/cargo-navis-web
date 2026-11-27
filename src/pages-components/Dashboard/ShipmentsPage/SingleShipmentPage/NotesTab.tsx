/**
 * Napomene (lab /order NotesPanel): „Napomena” (internal: seen by the whole company in the app, never on a PDF) and „Napomena za podvozara” (agency only, printed
 * on the podvozar's PDF), each with ✎ or „+ Dodaj napomenu”, edited in a dialog (max 255 characters, empty = removed).
 */

import * as React from 'react';

import { useDiscardGuard } from '@/components/shared/discard-changes';
import { ENTITY_ICON } from '@/components/shared/entity-icons';
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
import { track } from '@/lib/analytics';
import type { Shipment } from '@/lib/api';
import { useUpdateAgencyShipment, useUpdateShipment } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon, type IconType } from '@/ui';

const NOTE_MAX_LENGTH = 255;

type NoteType = 'internal' | 'external';

const NOTE: Record<NoteType, { title: string; hint: string; icon: IconType; field: 'internalNote' | 'externalNote' }> =
  {
    internal: {
      title: 'Napomena',
      hint: 'Vidi je samo tvoja tvrtka u aplikaciji. Ne ide ni na jedan PDF ni drugim primateljima.',
      icon: 'IconLock',
      field: 'internalNote',
    },
    external: {
      title: 'Napomena za podvozara',
      hint: 'Ispisuje se na PDF-u „Nalog za podvozara”.',
      // The podvozar's icon everywhere (shared/entity-icons).
      icon: ENTITY_ICON.contractor,
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
      // An agency nalog is patched through its own resource; the backend keeps externalNote on the outgoing order (the
      // podvozar's PDF).
      if (shipment.isAgency) await updateAgencyShipment({ id: shipment.id, [config.field]: note });
      else await updateShipment({ id: shipment.id, [config.field]: note });
      track('note saved', { kind: config.field === 'internalNote' ? 'internal' : 'external', cleared: !note });
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
            <DialogTitle>{config.title}</DialogTitle>
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

/** The note's icon and name, then ⓘ with the hint (who sees it) — as „Emailovi za obavijesti ⓘ” next to it. */
function NoteTitle({
  type,
  className,
  iconSize = 's',
  showHint = true,
}: {
  type: NoteType;
  className?: string;
  iconSize?: 's' | 'm';
  /** Off on an own nalog: with one note there's nothing to tell apart. */
  showHint?: boolean;
}) {
  const config = NOTE[type];
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <Icon className="text-muted-foreground" icon={config.icon} size={iconSize} /> {config.title}
      {showHint && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span aria-label="Što je ovo?" className="ml-0.5 inline-flex cursor-default text-muted-foreground" />
            }
          >
            <Icon icon="IconInfoCircle" size="s" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">{config.hint}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

function EditNoteButton({ type, onEdit }: { type: NoteType; onEdit(): void }) {
  return (
    <Button
      aria-label={`Uredi: ${NOTE[type].title}`}
      className="ml-auto text-muted-foreground"
      size="icon-sm"
      variant="ghost"
      onClick={onEdit}
    >
      <Icon icon="IconPencil" size="s" />
    </Button>
  );
}

function NoteText({ note, onEdit }: { note?: string; onEdit(): void }) {
  return note ? (
    <p className="text-sm whitespace-pre-wrap">{note}</p>
  ) : (
    <Button className="w-fit text-muted-foreground" size="sm" variant="ghost" onClick={onEdit}>
      <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj napomenu
    </Button>
  );
}

function NoteBlock({ type, note, onEdit }: { type: NoteType; note?: string; onEdit(): void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <NoteTitle className="text-sm font-medium" type={type} />
        {note && <EditNoteButton type={type} onEdit={onEdit} />}
      </div>
      <NoteText note={note} onEdit={onEdit} />
    </div>
  );
}

/**
 * Agency: „Napomene” with both notes. Own: the one note, so the panel itself is „Napomena” (as in the form) instead of
 * „Napomene” over „Napomena”.
 */
export function NotesTab({ shipment }: { shipment: Shipment }) {
  const [editing, setEditing] = React.useState<NoteType | null>(null);
  const dialog = editing && <NoteDialog shipment={shipment} type={editing} onClose={() => setEditing(null)} />;

  if (!shipment.isAgency) {
    return (
      <Panel
        action={shipment.internalNote && <EditNoteButton type="internal" onEdit={() => setEditing('internal')} />}
        bodyClassName="flex flex-col gap-4"
        // The panel's 16px title: a 20px icon.
        title={<NoteTitle iconSize="m" showHint={false} type="internal" />}
      >
        <NoteText note={shipment.internalNote} onEdit={() => setEditing('internal')} />
        {dialog}
      </Panel>
    );
  }

  return (
    <Panel bodyClassName="flex flex-col gap-4" title="Napomene">
      <NoteBlock note={shipment.internalNote} type="internal" onEdit={() => setEditing('internal')} />
      <div className="h-px bg-border" />
      <NoteBlock note={shipment.externalNote} type="external" onEdit={() => setEditing('external')} />
      {dialog}
    </Panel>
  );
}
