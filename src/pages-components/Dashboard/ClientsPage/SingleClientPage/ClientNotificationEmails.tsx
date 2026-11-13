import { useState } from 'react';

import type { Client, ClientNotificationEmail } from '@/lib/api';
import { useUpdateClient } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, Switch, Text, TextInput } from '@/ui';

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const email = normalizeEmail(newEmail);
    if (!isValidEmail(email)) return setInputError('Upišite ispravnu email adresu.');
    if (emails.some((c) => c.email === email)) return setInputError(`${email} je već u kontaktima.`);

    if (await save([...emails, { email, alwaysNotify: newAlwaysNotify }], `Kontakt ${email} dodan`)) {
      setNewEmail('');
      setNewAlwaysNotify(false);
    }
  }

  return (
    <FlexLayout className="flex-col gap-3 max-w-[760px]">
      <FlexLayout className="flex-col">
        <Text variant="text-m-medium">Kontakti za obavijesti</Text>
        <Text color="text-color-3" variant="text-xs">
          E-mail adrese koje primaju obavijesti o utovaru i istovaru tereta.<br></br>
          Automatski kontakti se sami dodaju na svaki novi nalog, ostali se nude kao prijedlog.
        </Text>
      </FlexLayout>

      <Box className="border border-dark-200 dark:border-light-800 rounded-m overflow-hidden">
        {emails.map(({ email, alwaysNotify }) => (
          <FlexLayout
            className="items-center gap-4 px-4 py-2 border-b border-dark-100 dark:border-light-850"
            key={email}
          >
            <Text className="flex-1 truncate" title={email} variant="text-xs-medium">
              {email}
            </Text>
            <Text color="text-color-3" variant="text-xxs">
              Automatski
            </Text>
            <Switch
              isDisabled={isPending}
              value={alwaysNotify}
              onChange={(value) =>
                save(
                  emails.map((c) => (c.email === email ? { ...c, alwaysNotify: value } : c)),
                  `Kontakt ${email} spremljen`
                )
              }
            />
            <Box
              aria-label={`Obriši ${email}`}
              as="button"
              className="p-1 rounded-s text-dark-600 dark:text-light-300 hover:bg-dark-75 dark:hover:bg-light-850 hover:text-red-500 disabled:opacity-40"
              isDisabled={isPending}
              type="button"
              onClick={() =>
                save(
                  emails.filter((c) => c.email !== email),
                  `Kontakt ${email} obrisan`
                )
              }
            >
              <Icon icon="IconTrash" size="s" />
            </Box>
          </FlexLayout>
        ))}

        <FlexLayout
          as="form"
          className="items-center gap-4 px-4 py-3 bg-dark-25 dark:bg-light-875"
          onSubmit={handleAdd}
        >
          <Box className="flex-1">
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
          <Text color="text-color-3" variant="text-xxs">
            Automatski
          </Text>
          <Switch isDisabled={isFull} value={newAlwaysNotify} onChange={setNewAlwaysNotify} />
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

      {inputError && (
        <Text color="text-red-600 dark:text-red-500" variant="text-xxxs">
          {inputError}
        </Text>
      )}
    </FlexLayout>
  );
};
