import * as React from 'react';

import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Client, ClientNotificationEmail } from '@/lib/api';
import { useUpdateClient } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

/** The two groups (lab /client-contacts A). Emails always go out by themselves when the driver confirms utovar or
 * istovar; `alwaysNotify` only says whether the address is put on every new nalog or offered there as a suggestion. */
const GROUPS = [
  {
    alwaysNotify: true,
    title: 'Na svaki novi nalog',
    hint: 'Ove email adrese će dobiti automatske obavijesti za svaki novi nalog.',
    icon: 'IconRepeat',
    move: 'Samo kad odaberem',
  },
  {
    alwaysNotify: false,
    title: 'Samo na naloge koje odabereš',
    hint: 'Ove email adrese će dobiti automatske obavijesti samo za naloge na koje ih dodaš.',
    icon: 'IconHandFinger',
    move: 'Na svaki novi nalog',
  },
] as const;

/**
 * KAN-112 notification contacts on the client page (DECISIONS §6b; lab /client-contacts option A, decided 2026-11-20):
 * the field first with „Dodaj na svaki novi nalog / naloge koje odaberem”, then the addresses in those two groups, each
 * with one line of copy and a link to move an address across. Saved straight away with today's client PUT (the whole
 * record goes along). Up to 20 addresses; no counter (the group titles count), the field says when the limit is hit.
 */
export function ClientNotificationEmails({ client }: { client: Client }) {
  const { mutateAsync: updateClient, isPending } = useUpdateClient(client.id);
  const [newEmail, setNewEmail] = React.useState('');
  const [newAlwaysNotify, setNewAlwaysNotify] = React.useState(true);
  const [inputError, setInputError] = React.useState<string>();

  const emails = client.notificationEmails ?? [];
  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;

  async function save(notificationEmails: ClientNotificationEmail[], successTitle: string, description?: string) {
    try {
      await updateClient({
        name: client.name,
        addressName: client.address.streetName,
        addressPostalCodeId: client.address.postalCodeId,
        taxId: client.taxId,
        termsOfPayment: client.termsOfPayment,
        notificationEmails,
      });
      showSuccessToast({ title: successTitle, description });
      return true;
    } catch {
      showErrorToast({ title: 'Spremanje adresa nije uspjelo', description: 'Pokušaj ponovno.' });
      return false;
    }
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const email = normalizeEmail(newEmail);
    if (!isValidEmail(email)) return setInputError('Upiši ispravnu email adresu.');
    if (emails.some((contact) => contact.email === email)) return setInputError(`${email} je već na popisu.`);

    if (await save([...emails, { email, alwaysNotify: newAlwaysNotify }], 'Adresa dodana', email)) setNewEmail('');
  }

  return (
    <Panel bodyClassName="p-0" title="Email obavijesti klijentu">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm text-muted-foreground">
          Kad vozač potvrdi utovar ili istovar, klijentu šaljemo email. Upiši adrese na koje ga šaljemo.
        </p>
        <form className="flex flex-col gap-2" noValidate onSubmit={(e) => void handleAdd(e)}>
          <Field data-invalid={inputError ? true : undefined}>
            <FieldLabel htmlFor="client-new-contact">Nova adresa</FieldLabel>
            <div className="flex gap-2">
              <Input
                aria-invalid={inputError ? true : undefined}
                disabled={isFull}
                id="client-new-contact"
                placeholder={
                  isFull ? `Dosegnut je limit od ${NOTIFICATION_EMAIL_LIMIT} adresa` : 'npr. logistika@klijent.hr'
                }
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
            {inputError && <FieldError>{inputError}</FieldError>}
          </Field>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            Dodaj na
            <ButtonGroup aria-label="Na koje naloge">
              {GROUPS.map((group) => (
                <Button
                  aria-pressed={newAlwaysNotify === group.alwaysNotify}
                  disabled={isFull}
                  key={group.icon}
                  size="xs"
                  type="button"
                  variant={newAlwaysNotify === group.alwaysNotify ? 'secondary' : 'outline'}
                  onClick={() => setNewAlwaysNotify(group.alwaysNotify)}
                >
                  <Icon data-icon="inline-start" icon={group.icon} size="xs" />
                  {group.alwaysNotify ? 'svaki novi nalog' : 'naloge koje odaberem'}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </form>
      </div>
      {GROUPS.map((group) => {
        const items = emails.filter((contact) => contact.alwaysNotify === group.alwaysNotify);
        return (
          <div className="border-t" key={group.icon}>
            <div className="flex flex-col gap-0.5 bg-muted/40 px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="text-muted-foreground" icon={group.icon} size="s" /> {group.title}
                <span className="text-muted-foreground tabular-nums">· {items.length}</span>
              </span>
              <span className="text-xs text-muted-foreground">{group.hint}</span>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">Nema adresa.</p>
            ) : (
              <ul className="divide-y">
                {items.map(({ email, alwaysNotify }) => (
                  <li className="flex min-h-11 items-center gap-2 px-4 py-1.5" key={email}>
                    <a
                      className="min-w-0 flex-1 truncate text-sm hover:underline"
                      href={`mailto:${email}`}
                      title={email}
                    >
                      {email}
                    </a>
                    <Button
                      className="shrink-0 text-muted-foreground"
                      disabled={isPending}
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        void save(
                          emails.map((contact) =>
                            contact.email === email ? { ...contact, alwaysNotify: !alwaysNotify } : contact
                          ),
                          alwaysNotify ? 'Samo na naloge koje odabereš' : 'Dodaje se na svaki novi nalog',
                          email
                        )
                      }
                    >
                      {group.move}
                    </Button>
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
                                'Adresa obrisana',
                                email
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
          </div>
        );
      })}
    </Panel>
  );
}
