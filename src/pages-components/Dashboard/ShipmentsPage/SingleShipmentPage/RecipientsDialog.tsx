/**
 * KAN-112 recipients of a saved nalog (today's ShipmentNotificationEmailsModal, new look; no lab): the list with ×,
 * a field to add one (Enter or „Dodaj”; validated on add and on blur, not per keystroke), and the client's contacts
 * not on the list yet as one-click suggestions („Na svaki nalog” ones marked). Up to 20. Dirty close asks first.
 */

import * as React from 'react';

import { useDiscardGuard } from '@/components/shared/discard-changes';
import { Badge } from '@/components/ui/badge';
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
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import type { Shipment } from '@/lib/api';
import { useUpdateAgencyShipment, useUpdateShipment } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { useLookups } from '../shared/lookups';

export function RecipientsDialog({ shipment, onClose }: { shipment: Shipment; onClose(): void }) {
  const { clientsById } = useLookups();
  const { mutateAsync: updateShipment } = useUpdateShipment();
  const { mutateAsync: updateAgencyShipment } = useUpdateAgencyShipment();
  // Compared and stored normalised (trimmed, lower case), so „Ana@X.hr” and „ana@x.hr” are one recipient.
  const saved = React.useMemo(
    () => [...new Set((shipment.notificationEmails ?? []).map(normalizeEmail))],
    [shipment.notificationEmails]
  );
  const [emails, setEmails] = React.useState<string[]>(saved);
  const [draft, setDraft] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const inputId = React.useId();

  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
  const suggestions = (client?.notificationEmails ?? []).filter(
    (contact) => !emails.includes(normalizeEmail(contact.email))
  );
  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;
  const dirty = emails.join('|') !== saved.join('|') || draft.trim() !== '';
  const guard = useDiscardGuard({ dirty: dirty && !isSaving, onClose });

  /** Adds the typed email; returns the list it ends with, or null when the typed text is wrong. */
  function addDraft(): string[] | null {
    const email = normalizeEmail(draft);
    if (!email) return emails;
    if (!isValidEmail(email)) {
      setError('Neispravan email.');
      return null;
    }
    if (emails.includes(email)) {
      setDraft('');
      return emails;
    }
    if (isFull) {
      setError(`Nalog može imati najviše ${NOTIFICATION_EMAIL_LIMIT} primatelja.`);
      return null;
    }
    const next = [...emails, email];
    setEmails(next);
    setDraft('');
    setError(null);
    return next;
  }

  async function handleSave() {
    const next = addDraft();
    if (!next) return;
    setIsSaving(true);
    try {
      if (shipment.isAgency) await updateAgencyShipment({ id: shipment.id, notificationEmails: next });
      else await updateShipment({ id: shipment.id, notificationEmails: next });
      showSuccessToast({ title: 'Emailovi za obavijesti spremljeni' });
      onClose();
    } catch (saveError) {
      console.error(saveError);
      showErrorToast({ title: 'Emailovi nisu spremljeni. Pokušaj ponovno.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && !isSaving && guard.requestClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emailovi za obavijesti</DialogTitle>
            <DialogDescription>Primaju mail kad se teret utovari i istovari.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {emails.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {emails.map((email) => (
                  <li key={email}>
                    <Badge className="h-7 gap-1 pr-1 pl-2.5 text-xs" variant="secondary">
                      {email}
                      <button
                        aria-label={`Makni ${email}`}
                        className="rounded-full p-0.5 hover:bg-foreground/10"
                        type="button"
                        onClick={() => setEmails((current) => current.filter((item) => item !== email))}
                      >
                        <Icon className="size-3.5! [&_svg]:size-full!" icon="IconX" size="xs" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nema primatelja.</p>
            )}

            <Field data-invalid={!!error || undefined}>
              <FieldLabel htmlFor={inputId}>Dodaj primatelja</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Icon icon="IconMail" size="s" />
                </InputGroupAddon>
                <InputGroupInput
                  aria-invalid={!!error || undefined}
                  disabled={isFull}
                  id={inputId}
                  placeholder="ime@tvrtka.hr"
                  type="email"
                  value={draft}
                  onBlur={() => draft.trim() && addDraft()}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addDraft();
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton disabled={!draft.trim()} onClick={() => addDraft()}>
                    Dodaj
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>
                  Najviše {NOTIFICATION_EMAIL_LIMIT} primatelja ({emails.length}/{NOTIFICATION_EMAIL_LIMIT}).
                </FieldDescription>
              )}
            </Field>

            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">Kontakti klijenta</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((contact) => (
                    <Button
                      disabled={isFull}
                      key={contact.email}
                      size="xs"
                      variant="outline"
                      onClick={() => setEmails((current) => [...new Set([...current, normalizeEmail(contact.email)])])}
                    >
                      <Icon data-icon="inline-start" icon="IconPlus" size="xs" /> {contact.email}
                      {contact.alwaysNotify && <span className="text-muted-foreground">· Na svaki nalog</span>}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
