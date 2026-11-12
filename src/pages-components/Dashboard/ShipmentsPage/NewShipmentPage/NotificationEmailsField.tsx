import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { useClients } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import type { ShipmentFields } from './types.d';

const SEPARATORS = /[\s,;]+/;

interface NotificationEmailsFieldProps {
  /** Add the client's automatic contacts whenever a client is picked. Off when editing a saved shipment. */
  isAutofillEnabled: boolean;
}

export const NotificationEmailsField: React.FC<NotificationEmailsFieldProps> = ({ isAutofillEnabled }) => {
  const { control, setValue } = useFormContext<ShipmentFields>();
  const clientId = useWatch({ control, name: 'clientId' });
  const { field, fieldState } = useController({ control, name: 'notificationEmails' });
  const emails = useMemo(() => field.value ?? [], [field.value]);

  const { data: clients } = useClients();
  const client = clients?.find((c) => c.id === clientId);
  const contacts = useMemo(
    () => (client?.notificationEmails ?? []).map((c) => ({ ...c, email: normalizeEmail(c.email) })),
    [client]
  );
  const automaticEmails = useMemo(() => contacts.filter((c) => c.alwaysNotify).map((c) => c.email), [contacts]);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputError, setInputError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Remembers what was auto-added, so switching client swaps those and keeps manually added ones.
  const autofilled = useRef<{ clientId?: string; emails: string[] }>({ emails: [] });

  useEffect(() => {
    if (!isAutofillEnabled) return;
    if (clientId && !client) return; // clients still loading
    if (autofilled.current.clientId === (client?.id ?? undefined)) return;

    const kept = emails.filter((e) => !autofilled.current.emails.includes(e));
    const next = [...automaticEmails.filter((e) => !kept.includes(e)), ...kept].slice(0, NOTIFICATION_EMAIL_LIMIT);
    autofilled.current = { clientId: client?.id, emails: automaticEmails };
    setValue('notificationEmails', next, { shouldValidate: true });
  }, [isAutofillEnabled, clientId, client, automaticEmails, emails, setValue]);

  const isFull = emails.length >= NOTIFICATION_EMAIL_LIMIT;
  const normalizedQuery = normalizeEmail(query);
  const suggestions = contacts.filter((c) => !emails.includes(c.email) && c.email.includes(normalizedQuery));

  function addEmails(values: string[]) {
    const next = [...emails];
    for (const raw of values) {
      const email = normalizeEmail(raw);
      if (!email || next.includes(email)) continue;
      if (!isValidEmail(email)) {
        setInputError(`"${raw.trim()}" nije ispravna email adresa.`);
        field.onChange(next);
        setQuery(raw.trim());
        return;
      }
      if (next.length >= NOTIFICATION_EMAIL_LIMIT) break;
      next.push(email);
    }
    field.onChange(next);
    setQuery('');
    setInputError(undefined);
    setActiveIndex(0);
  }

  function removeEmail(email: string) {
    field.onChange(emails.filter((e) => e !== email));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => (suggestions.length ? (i + delta + suggestions.length) % suggestions.length : 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const picked = isOpen ? suggestions[activeIndex] : undefined;
      addEmails([picked?.email ?? query]);
      return;
    }
    if ((e.key === ',' || e.key === ';' || e.key === 'Tab') && query.trim()) {
      e.preventDefault();
      addEmails([query]);
      return;
    }
    if (e.key === 'Backspace' && !query && emails.length) {
      field.onChange(emails.slice(0, -1));
      return;
    }
    if (e.key === 'Escape') setIsOpen(false);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const parts = e.clipboardData.getData('text').split(SEPARATORS).filter(Boolean);
    if (parts.length < 2) return;
    e.preventDefault();
    addEmails(parts);
  }

  const errorText = inputError ?? fieldState.error?.message;

  return (
    <FlexLayout className="flex-col gap-1">
      <FlexLayout className="items-center justify-between">
        <label htmlFor="notification-emails-input">
          <Text color="text-color-3" variant="text-xxs-medium">
            Primatelji obavijesti
          </Text>
        </label>
        <Text color="text-red-600 dark:text-red-500" variant="text-xxxs">
          {errorText ?? <>&ensp;</>}
        </Text>
      </FlexLayout>

      <Box
        className={clsx(
          'relative flex flex-wrap items-center gap-[6px] px-2 py-[6px] min-h-[52px] rounded-s border-[2px] cursor-text',
          errorText ? 'border-red-500' : 'border-dark-300 dark:border-light-800',
          'hover:border-dark-500 hover:dark:border-light-700',
          'focus-within:!border-teal-600 dark:focus-within:!border-teal-800'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {emails.map((email) => {
          const isAutomatic = automaticEmails.includes(email);
          return (
            <FlexLayout
              className={clsx(
                'items-center gap-1 h-[30px] pl-2 pr-1 rounded-s border max-w-full',
                isAutomatic
                  ? 'bg-teal-50 border-teal-100 dark:bg-teal-900/40 dark:border-teal-800'
                  : 'bg-dark-50 border-dark-200 dark:bg-light-850 dark:border-light-800'
              )}
              key={email}
              title={isAutomatic ? 'Automatski kontakt klijenta' : undefined}
            >
              {isAutomatic && <Icon color="text-teal-600 dark:text-teal-400" icon="IconBolt" size="s" />}
              <Text className="truncate" variant="text-xxs">
                {email}
              </Text>
              <Box
                aria-label={`Ukloni ${email}`}
                as="button"
                className="p-[3px] rounded-xs text-dark-600 dark:text-light-300 hover:bg-dark-100 dark:hover:bg-light-800"
                type="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
              >
                <Icon icon="IconX" size="s" />
              </Box>
            </FlexLayout>
          );
        })}

        <input
          autoComplete="off"
          className={clsx(
            'flex-1 min-w-[160px] p-1 bg-transparent outline-none font-display text-xs md:text-s',
            'text-dark-800 dark:text-light-50 placeholder:text-dark-400 dark:placeholder:text-light-800',
            'caret-teal-600 dark:caret-teal-800 disabled:cursor-not-allowed'
          )}
          disabled={isFull}
          id="notification-emails-input"
          placeholder={
            isFull ? 'Uklonite mail za dodavanje novog' : emails.length ? 'Dodaj mail...' : 'Upišite email primatelja'
          }
          ref={inputRef}
          type="email"
          value={query}
          onBlur={() => {
            setIsOpen(false);
            if (query.trim()) addEmails([query]);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setInputError(undefined);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        {isOpen && !isFull && suggestions.length > 0 && (
          <FlexLayout
            className="absolute z-30 left-[-2px] right-[-2px] top-[calc(100%+6px)] flex-col p-1 bg-white dark:bg-light-875 border border-dark-200 dark:border-light-800 rounded-m shadow-lg max-h-[240px] overflow-y-auto"
            role="listbox"
          >
            <Text className="px-2 pt-1" color="text-color-4" variant="text-xxxs-medium">
              Kontakti klijenta
            </Text>
            {suggestions.map((s, i) => (
              <FlexLayout
                aria-selected={i === activeIndex}
                className={clsx(
                  'items-center justify-between gap-3 px-2 py-2 rounded-s cursor-pointer',
                  i === activeIndex ? 'bg-dark-75 dark:bg-light-850' : 'hover:bg-dark-50 dark:hover:bg-light-850'
                )}
                key={s.email}
                role="option"
                // mousedown keeps focus in the input, so its blur doesn't add the half-typed query first
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  addEmails([s.email]);
                }}
              >
                <Text className="truncate" variant="text-xxs">
                  {s.email}
                </Text>
                <Text color="text-color-4" variant="text-xxxs">
                  {s.alwaysNotify ? 'Automatski' : 'Ručno'}
                </Text>
              </FlexLayout>
            ))}
          </FlexLayout>
        )}
      </Box>

      <FlexLayout className="justify-between gap-3">
        <Text color="text-color-3" variant="text-xxxs">
          {client
            ? 'Novi mail se sprema i u kontakte klijenta.'
            : 'Odaberite klijenta za prijedloge iz njegovih kontakata.'}
        </Text>
        <Text color="text-color-3" variant="text-xxxs">
          {emails.length} / {NOTIFICATION_EMAIL_LIMIT}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};
