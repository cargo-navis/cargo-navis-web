import clsx from 'clsx';
import { useState } from 'react';

import type { Client, ClientNotificationEmail } from '@/lib/api';
import { useUpdateClient } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Pill, Switch, Text, TextInput, Tooltip } from '@/ui';

const AUTOMATIC_TOOLTIP =
  'Ovaj email se sam dodaje kao primatelj na svaki novi nalog ovog klijenta i dobiva mail kad se teret utovari i kad se istovari. Na pojedinom nalogu ga možete ukloniti.';
const MANUAL_TOOLTIP =
  'Ovaj email se ne dodaje sam. Kod kreiranja naloga nudi se kao prijedlog, pa obavijesti prima samo za naloge na koje ga dodate.';

export const ClientNotificationEmails: React.FC<{ client: Client }> = ({ client }) => {
  const { mutateAsync: updateClient, isPending } = useUpdateClient(client.id);
  const [newEmail, setNewEmail] = useState('');
  const [newAlwaysNotify, setNewAlwaysNotify] = useState(false);
  const [inputError, setInputError] = useState<string>();

  const emails = client.notificationEmails ?? [];
  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;

  async function save(notificationEmails: ClientNotificationEmail[], successTitle: string) {
    try {
      // The client PUT expects the full record, so the unchanged fields go along.
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

  async function handleAdd() {
    const email = normalizeEmail(newEmail);
    if (!isValidEmail(email)) {
      setInputError('Upišite ispravnu email adresu.');
      return;
    }
    if (emails.some((e) => normalizeEmail(e.email) === email)) {
      setInputError(`${email} je već u kontaktima.`);
      return;
    }

    const saved = await save([...emails, { email, alwaysNotify: newAlwaysNotify }], `Kontakt ${email} dodan`);
    if (saved) {
      setNewEmail('');
      setNewAlwaysNotify(false);
      setInputError(undefined);
    }
  }

  function handleToggle(email: string, alwaysNotify: boolean) {
    void save(
      emails.map((e) => (e.email === email ? { ...e, alwaysNotify } : e)),
      alwaysNotify ? `${email} se automatski dodaje na nove naloge` : `${email} se više ne dodaje automatski`
    );
  }

  function handleDelete(email: string) {
    void save(
      emails.filter((e) => e.email !== email),
      `Kontakt ${email} obrisan`
    );
  }

  return (
    <FlexLayout className="flex-col gap-3 max-w-[760px]">
      <FlexLayout className="flex-col">
        <Text variant="text-m-medium">Kontakti za obavijesti</Text>
        <Text color="text-color-3" variant="text-xs">
          Definirajte emailove klijenata na koje ćemo poslati obavijesti kad se njihovi tereti utovare i istovare.
        </Text>
      </FlexLayout>

      <Box className="border border-dark-200 dark:border-light-800 rounded-m overflow-hidden">
        {emails.length === 0 && (
          <Box className="px-4 py-3 border-b border-dark-100 dark:border-light-850">
            <Text color="text-color-3" variant="text-xs">
              Klijent još nema kontakata. Dodajte prvi mail ispod.
            </Text>
          </Box>
        )}
        {emails.map(({ email, alwaysNotify }) => (
          <FlexLayout
            className="items-center gap-4 px-4 py-2 border-b border-dark-100 dark:border-light-850 flex-wrap"
            key={email}
          >
            <Text className="flex-1 min-w-[200px] truncate" title={email} variant="text-xs-medium">
              {email}
            </Text>
            <FlexLayout className="items-center gap-3">
              <Switch isDisabled={isPending} value={alwaysNotify} onChange={(value) => handleToggle(email, value)} />
              <Tooltip
                content={
                  <Text className="px-2 py-1 max-w-[280px]" color="text-light-50" variant="text-xxs">
                    {alwaysNotify ? AUTOMATIC_TOOLTIP : MANUAL_TOOLTIP}
                  </Text>
                }
                isPortal
              >
                <Box className="inline-flex cursor-help" tabIndex={0}>
                  <Pill
                    size="s"
                    text={alwaysNotify ? 'Automatski' : 'Ručno'}
                    variant={alwaysNotify ? 'info' : 'default'}
                  />
                </Box>
              </Tooltip>
            </FlexLayout>
            <Box
              aria-label={`Obriši ${email}`}
              as="button"
              className={clsx(
                'p-1 rounded-s text-dark-600 dark:text-light-300 hover:bg-dark-75 dark:hover:bg-light-850 hover:text-red-500',
                isPending && 'opacity-40 pointer-events-none'
              )}
              type="button"
              onClick={() => handleDelete(email)}
            >
              <Icon icon="IconTrash" size="s" />
            </Box>
          </FlexLayout>
        ))}

        <FlexLayout
          as="form"
          className="items-center gap-4 px-4 py-3 bg-dark-25 dark:bg-light-875 flex-wrap"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            void handleAdd();
          }}
        >
          <Box className="flex-1 min-w-[200px]">
            <TextInput
              isDisabled={isFull}
              placeholder={isFull ? `Dosegnut je limit od ${NOTIFICATION_EMAIL_LIMIT} kontakata` : 'Novi email kontakt'}
              type="email"
              value={newEmail}
              onChange={(value) => {
                setNewEmail(value);
                setInputError(undefined);
              }}
            />
          </Box>
          <FlexLayout className="items-center gap-2">
            <Switch isDisabled={isFull} value={newAlwaysNotify} onChange={setNewAlwaysNotify} />
            <Text color="text-color-3" variant="text-xxs">
              Uvijek obavijesti
            </Text>
          </FlexLayout>
          <Button
            iconLeft="IconPlus"
            isDisabled={isFull || !newEmail.trim()}
            isLoading={isPending}
            size="s"
            text="Dodaj"
            type="submit"
          />
        </FlexLayout>
      </Box>

      <FlexLayout className="justify-between gap-3 flex-wrap">
        {inputError ? (
          <Text color="text-red-600 dark:text-red-500" variant="text-xxxs">
            {inputError}
          </Text>
        ) : (
          <Text color="text-color-3" variant="text-xxxs">
            &quot;Automatski&quot; kontakti se sami dodaju na svaki novi nalog. &quot;Ručno&quot; se nude kod kreiranja
            naloga.
          </Text>
        )}
        <Text color="text-color-3" variant="text-xxxs">
          {emails.length} / {NOTIFICATION_EMAIL_LIMIT}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};
