import { useEffect, useId, useRef } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';

import { useClients } from '@/lib/hooks';
import { isValidEmail, normalizeEmail, NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import type { SelectOption } from '@/ui';
import commonComponents from '@/ui/components/Select/commonComponents';
import { commonStyles, commonStylesClassNames } from '@/ui/components/Select/commonStyles';
import { withFieldLabels } from '@/ui/hocs';

import type { ShipmentFields } from './types.d';

const EmailsSelect = withFieldLabels(CreatableSelect<SelectOption, true>);

interface NotificationEmailsFieldProps {
  /** Fill in the client's automatic contacts whenever a client is picked. Off when editing a saved shipment. */
  isAutofillEnabled: boolean;
}

export const NotificationEmailsField: React.FC<NotificationEmailsFieldProps> = ({ isAutofillEnabled }) => {
  const { control, setValue } = useFormContext<ShipmentFields>();
  const clientId = useWatch({ control, name: 'clientId' });
  const { field, fieldState } = useController({ control, name: 'notificationEmails' });
  const emails = field.value ?? [];
  const instanceId = useId();

  const { data: clients } = useClients();
  const client = clients?.find((c) => c.id === clientId);
  const contacts = client?.notificationEmails ?? [];

  const autofilledClientId = useRef<string>();
  useEffect(() => {
    if (!isAutofillEnabled || !client || autofilledClientId.current === client.id) return;
    autofilledClientId.current = client.id;
    const automatic = (client.notificationEmails ?? []).filter((c) => c.alwaysNotify).map((c) => c.email);
    setValue('notificationEmails', automatic.slice(0, NOTIFICATION_EMAIL_LIMIT), { shouldValidate: true });
  }, [isAutofillEnabled, client, setValue]);

  function addEmail(value: string) {
    const email = normalizeEmail(value);
    if (isValidEmail(email) && !emails.includes(email)) field.onChange([...emails, email]);
  }

  return (
    <EmailsSelect
      classNames={{
        ...commonStylesClassNames,
        multiValue: () => '!bg-dark-50 dark:!bg-light-850 !rounded-s',
        multiValueLabel: () => '!text-xxs !text-dark-800 dark:!text-light-50',
        multiValueRemove: () => '!text-dark-600 dark:!text-light-300 hover:!bg-dark-100 dark:hover:!bg-light-800',
      }}
      components={commonComponents}
      errorText={fieldState.error?.message}
      getNewOptionData={(value) => ({ value, label: `Dodaj ${normalizeEmail(value)}` })}
      instanceId={instanceId}
      isMulti
      isValidNewOption={(value) => isValidEmail(normalizeEmail(value)) && !emails.includes(normalizeEmail(value))}
      label="Emailovi za obavijestiti"
      noOptionsMessage={({ inputValue }) =>
        inputValue ? 'Neispravan ili već dodan email' : 'Upišite email primatelja'
      }
      options={contacts.map((c) => ({
        value: c.email,
        label: c.email,
        helper: c.alwaysNotify ? 'Automatski' : undefined,
      }))}
      placeholder="Upišite ili odaberite email"
      styles={commonStyles}
      value={emails.map((email) => ({ value: email, label: email }))}
      onBlur={field.onBlur}
      onChange={(options) => field.onChange(options.map((o) => o.value))}
      onCreateOption={addEmail}
      // A typed but unconfirmed email is kept when the field loses focus
      onInputChange={(_, meta) => {
        if (meta.action === 'input-blur') addEmail(meta.prevInputValue);
      }}
    />
  );
};
