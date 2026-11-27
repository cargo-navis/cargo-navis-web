import * as React from 'react';

import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { Icon } from '@/ui';

import { formatEuro, formatNumber, getMargin } from '../shared/format';
import { STATUS_TEXT } from '../shared/tones';
import { ChoiceCards, ErrorText, FieldLink, Label, NumberInput, useNalogForm } from './form-context';
import { PartnerCombobox } from './PartnerCombobox';
import { fieldDomId, parseNumber, withAgency } from './values';

/** Nalog (lab /nalog-form `NalogFields`): Klijent, Cijena, Vanjska referenca, KAN-112 recipients, „Tko vozi?”. */
export function NalogFields({ onNewClient, onNewContractor }: { onNewClient(): void; onNewContractor(): void }) {
  const { values, set, errorOf, touch, clients } = useNalogForm();
  const clientError = errorOf('clientId');
  const priceError = errorOf('price');

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2" data-invalid={clientError ? true : undefined}>
          <Label field="clientId" htmlFor={fieldDomId('clientId')}>
            Klijent
          </Label>
          <PartnerCombobox
            id={fieldDomId('clientId')}
            invalid={!!clientError}
            items={clients}
            placeholder="Naziv ili porezni broj"
            value={values.clientId}
            onBlur={() => touch('clientId')}
            onChange={(clientId) => set({ clientId }, 'clientId')}
          />
          {clientError ? (
            <ErrorText>{clientError}</ErrorText>
          ) : (
            <FieldLink onClick={onNewClient}>+ Novi klijent</FieldLink>
          )}
        </Field>
        <Field data-invalid={priceError ? true : undefined}>
          <Label field="price" htmlFor={fieldDomId('price')}>
            Cijena
          </Label>
          <NumberInput
            field="price"
            invalid={!!priceError}
            unit="€"
            value={values.price}
            onBlur={() => touch('price')}
            onChange={(price) => set({ price }, 'price')}
          />
          <ErrorText>{priceError}</ErrorText>
        </Field>
        <Field>
          <Label field="externalOrderReference" htmlFor={fieldDomId('externalOrderReference')}>
            Vanjska referenca
          </Label>
          <Input
            id={fieldDomId('externalOrderReference')}
            placeholder="Broj narudžbe klijenta"
            value={values.externalOrderReference}
            onChange={(event) => set({ externalOrderReference: event.target.value }, 'externalOrderReference')}
          />
        </Field>
      </div>
      <RecipientsField />
      <AgencyFields onNewContractor={onNewContractor} />
    </div>
  );
}

function AgencyFields({ onNewContractor }: { onNewContractor(): void }) {
  const { values, set, errorOf, touch, contractors, tenantId } = useNalogForm();
  const contractorError = errorOf('transportContractorId');
  const priceError = errorOf('agencyPrice');
  const price = parseNumber(values.price);
  const contractorPrice = parseNumber(values.agencyPrice);
  const { earnings, percent, isLoss } = getMargin(price ?? 0, contractorPrice ?? 0);

  return (
    <>
      <Field>
        <Label>Tko vozi?</Label>
        <ChoiceCards
          label="Tko vozi?"
          options={[
            { key: 'own', label: 'Vlastiti prijevoz', description: 'Naše vozilo i vozač' },
            { key: 'agency', label: 'Agencijski', description: 'Vozi podvozar', icon: ENTITY_ICON.agency },
          ]}
          value={values.isAgency ? 'agency' : 'own'}
          onChange={(key) => set(withAgency(values, key === 'agency', tenantId))}
        />
      </Field>
      {values.isAgency && (
        <div className="flex flex-col gap-4 border-l-2 border-agency-300 pl-4 dark:border-agency-700">
          <Field data-invalid={contractorError ? true : undefined}>
            <Label htmlFor={fieldDomId('transportContractorId')}>Podvozar</Label>
            <PartnerCombobox
              id={fieldDomId('transportContractorId')}
              invalid={!!contractorError}
              items={contractors}
              placeholder="Odaberi podvozara"
              value={values.transportContractorId}
              onBlur={() => touch('transportContractorId')}
              onChange={(transportContractorId) => set({ transportContractorId })}
            />
            {contractorError ? (
              <ErrorText>{contractorError}</ErrorText>
            ) : (
              <FieldLink onClick={onNewContractor}>+ Novi podvozar</FieldLink>
            )}
          </Field>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field data-invalid={priceError ? true : undefined}>
              <Label htmlFor={fieldDomId('agencyPrice')}>Cijena podvozara</Label>
              <NumberInput
                field="agencyPrice"
                invalid={!!priceError}
                unit="€"
                value={values.agencyPrice}
                onBlur={() => touch('agencyPrice')}
                onChange={(agencyPrice) => set({ agencyPrice })}
              />
              <ErrorText>{priceError}</ErrorText>
            </Field>
            <div className="flex flex-col gap-1 rounded-lg bg-muted/60 px-3 py-2">
              <span className="text-xs text-muted-foreground">RUC (razlika u cijeni)</span>
              <span
                className={cn(
                  'font-heading text-xl font-bold tracking-tight tabular-nums',
                  isLoss ? 'text-destructive' : STATUS_TEXT.success
                )}
              >
                {isLoss ? '−' : ''}
                {formatEuro(Math.abs(earnings))}
              </span>
              {price ? (
                <span className="text-xs text-muted-foreground tabular-nums">Marža {formatNumber(percent, 1)} %</span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * KAN-112 recipients (no lab; today's NotificationEmailsField in the look of the Nalog page's recipients dialog):
 * chips with ×, a field to add one (Enter, „Dodaj” or leaving the field; checked then, not per keystroke), the client's
 * contacts not on the list as one-click suggestions. A new nalog starts from the client's automatic contacts.
 */
function RecipientsField() {
  const { values, set, clients, errorOf } = useNalogForm();
  const [draft, setDraft] = React.useState('');
  const [inputError, setError] = React.useState<string | null>(null);
  // The typed email first; then a problem with the list itself (e.g. over the limit after a client change).
  const error = inputError ?? errorOf('notificationEmails');
  const emails = values.notificationEmails;
  const client = clients.find((item) => item.id === values.clientId);
  const suggestions = (client?.notificationEmails ?? []).filter(
    (contact) => !emails.includes(normalizeEmail(contact.email))
  );
  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;
  const id = fieldDomId('notificationEmails');

  function add(value: string) {
    const email = normalizeEmail(value);
    if (!email) return;
    if (!isValidEmail(email)) {
      setError('Neispravan email.');
      return;
    }
    if (!emails.includes(email)) {
      if (isFull) {
        setError(`Nalog može imati najviše ${NOTIFICATION_EMAIL_LIMIT} primatelja.`);
        return;
      }
      set({ notificationEmails: [...emails, email] });
    }
    setDraft('');
    setError(null);
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <Label htmlFor={id}>Emailovi za obavijesti</Label>
      {emails.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {emails.map((email) => (
            <li key={email}>
              <Badge className="h-7 gap-1 pr-1 pl-2.5 text-xs" variant="secondary">
                {email}
                <button
                  aria-label={`Makni ${email}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                  type="button"
                  onClick={() => set({ notificationEmails: emails.filter((item) => item !== email) })}
                >
                  <Icon className="size-3.5! [&_svg]:size-full!" icon="IconX" size="xs" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <InputGroup>
        <InputGroupAddon>
          <Icon icon="IconMail" size="s" />
        </InputGroupAddon>
        <InputGroupInput
          aria-invalid={error ? true : undefined}
          disabled={isFull}
          id={id}
          placeholder="ime@tvrtka.hr"
          type="email"
          value={draft}
          onBlur={() => draft.trim() && add(draft)}
          onChange={(event) => {
            setDraft(event.target.value);
            if (inputError) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add(draft);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled={!draft.trim()} onClick={() => add(draft)}>
            Dodaj
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <FieldDescription>Ove email adrese će dobiti poruku kad se teret utovari i istovari.</FieldDescription>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((contact) => (
            <Button
              disabled={isFull}
              key={contact.email}
              size="xs"
              variant="outline"
              onClick={() => set({ notificationEmails: [...new Set([...emails, normalizeEmail(contact.email)])] })}
            >
              <Icon data-icon="inline-start" icon="IconPlus" size="xs" /> {contact.email}
              {contact.alwaysNotify && <span className="text-muted-foreground">· Na svaki nalog</span>}
            </Button>
          ))}
        </div>
      )}
    </Field>
  );
}

/** Napomene (lab `NoteFields`): „Napomena” je interna, a „Napomena za podvozara” ide na njegov PDF (samo agency). */
export function NoteFields() {
  const { values, set } = useNalogForm();
  return (
    // One below the other: notes are long text, a half-width column made them cramped.
    <div className="flex flex-col gap-4">
      <Field>
        <Label field="internalNote" htmlFor={fieldDomId('internalNote')}>
          Napomena
        </Label>
        <Textarea
          id={fieldDomId('internalNote')}
          rows={3}
          value={values.internalNote}
          onChange={(event) => set({ internalNote: event.target.value }, 'internalNote')}
        />
        <FieldDescription>Samo za tebe, ne ide ni na jedan PDF.</FieldDescription>
      </Field>
      {values.isAgency && (
        <Field>
          <Label field="externalNote" htmlFor={fieldDomId('externalNote')}>
            Napomena za podvozara
          </Label>
          <Textarea
            id={fieldDomId('externalNote')}
            rows={3}
            value={values.externalNote}
            onChange={(event) => set({ externalNote: event.target.value }, 'externalNote')}
          />
          <FieldDescription>Ispisuje se na PDF-u „Nalog za podvozara” koji preuzimaš.</FieldDescription>
        </Field>
      )}
    </div>
  );
}
