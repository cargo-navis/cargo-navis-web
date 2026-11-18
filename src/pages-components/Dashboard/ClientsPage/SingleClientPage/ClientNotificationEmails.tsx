import * as React from 'react';

import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Client, ClientNotificationEmail } from '@/lib/api';
import { useUpdateClient } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

/**
 * KAN-112 notification contacts on the client page (DECISIONS §6b; no lab, built in the /partners look): the emails
 * that get load / unload notifications. „Automatski” ones go on every new nalog of this client, the rest are offered
 * as suggestions. Saved straight away with today's client PUT (the whole record goes along).
 */
export function ClientNotificationEmails({ client }: { client: Client }) {
  const { mutateAsync: updateClient, isPending } = useUpdateClient(client.id);
  const [newEmail, setNewEmail] = React.useState('');
  const [newAlwaysNotify, setNewAlwaysNotify] = React.useState(false);
  const [inputError, setInputError] = React.useState<string>();

  const emails = client.notificationEmails ?? [];
  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;

  async function save(notificationEmails: ClientNotificationEmail[], successTitle: string) {
    try {
      await updateClient({
        name: client.name,
        addressName: client.address.streetName,
        addressPostalCodeId: client.address.postalCodeId,
        taxId: client.taxId,
        termsOfPayment: client.termsOfPayment,
        notificationEmails,
      });
      showSuccessToast({ title: successTitle });
      return true;
    } catch {
      showErrorToast({ title: 'Spremanje kontakata nije uspjelo. Pokušajte ponovno.' });
      return false;
    }
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const email = normalizeEmail(newEmail);
    if (!isValidEmail(email)) return setInputError('Upiši ispravnu email adresu.');
    if (emails.some((contact) => contact.email === email)) return setInputError(`${email} je već u kontaktima.`);

    if (await save([...emails, { email, alwaysNotify: newAlwaysNotify }], `Kontakt ${email} dodan`)) {
      setNewEmail('');
      setNewAlwaysNotify(false);
    }
  }

  return (
    <Panel bodyClassName="p-0" title="Kontakti za obavijesti">
      <p className="px-4 pt-3 pb-1 text-xs text-muted-foreground">
        Primaju obavijesti o utovaru i istovaru. Automatski se dodaju na svaki novi nalog, ostali se nude kao prijedlog.
      </p>
      {emails.length > 0 && (
        <ul className="divide-y">
          {emails.map(({ email, alwaysNotify }) => (
            <li className="flex min-h-11 items-center gap-3 px-4 py-1.5" key={email}>
              <a className="min-w-0 flex-1 truncate text-sm hover:underline" href={`mailto:${email}`} title={email}>
                {email}
              </a>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                Automatski
                <Switch
                  aria-label={`Automatski: ${email}`}
                  checked={alwaysNotify}
                  disabled={isPending}
                  onCheckedChange={(value) =>
                    void save(
                      emails.map((contact) =>
                        contact.email === email ? { ...contact, alwaysNotify: value } : contact
                      ),
                      `Kontakt ${email} spremljen`
                    )
                  }
                />
              </label>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label={`Obriši ${email}`}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        void save(
                          emails.filter((contact) => contact.email !== email),
                          `Kontakt ${email} obrisan`
                        )
                      }
                    />
                  }
                >
                  <Icon icon="IconTrash" size="s" />
                </TooltipTrigger>
                <TooltipContent>Obriši</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-3 border-t bg-muted/40 px-4 py-3"
        noValidate
        onSubmit={(e) => void handleAdd(e)}
      >
        <Field data-invalid={inputError ? true : undefined}>
          <FieldLabel className="sr-only" htmlFor="client-new-contact">
            Novi kontakt
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              aria-invalid={inputError ? true : undefined}
              disabled={isFull}
              id="client-new-contact"
              placeholder={isFull ? `Dosegnut je limit od ${NOTIFICATION_EMAIL_LIMIT} kontakata` : 'Novi email kontakt'}
              type="email"
              value={newEmail}
              onChange={(event) => {
                setNewEmail(event.target.value);
                setInputError(undefined);
              }}
            />
            <Button disabled={isFull} loading={isPending} type="submit" variant="outline">
              <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj
            </Button>
          </div>
          {inputError ? (
            <FieldError>{inputError}</FieldError>
          ) : (
            <FieldDescription className="text-xs">
              {emails.length === 0 ? 'Još nema kontakata.' : `${emails.length} od ${NOTIFICATION_EMAIL_LIMIT}`}
            </FieldDescription>
          )}
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={newAlwaysNotify} disabled={isFull} onCheckedChange={setNewAlwaysNotify} />
          Automatski na svakom novom nalogu
        </label>
      </form>
    </Panel>
  );
}
