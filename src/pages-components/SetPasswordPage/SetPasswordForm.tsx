import { useRouter } from 'next/router';
import * as React from 'react';

import { PASSWORD_RULES, PasswordChecklist, PasswordInput } from '@/components/shared/password';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { acceptInvite } from '@/lib/api';
import { showSuccessToast } from '@/lib/utils/toast';

import type { FormValues } from './types';
import { validateSetPassword } from './validation';

interface SetPasswordFormProps {
  token: string;
  /** From the link; only for password managers (hidden username field). */
  email: string;
  /** Any failure of accept-invite means the link can't be used (the page swaps the form for InvalidLink). */
  onLinkRejected(): void;
}

/** Validates on blur and on submit (DECISIONS §2); the button is always enabled and jumps to the first problem. */
export const SetPasswordForm = ({ token, email, onLinkRejected }: SetPasswordFormProps) => {
  const { push } = useRouter();

  const [values, setValues] = React.useState<FormValues>({ newPassword: '', confirmPassword: '' });
  const [touched, setTouched] = React.useState({ newPassword: false, confirmPassword: false });
  const [submitting, setSubmitting] = React.useState(false);
  const newPasswordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

  const errors = validateSetPassword(values);
  const newPasswordError = touched.newPassword ? errors.newPassword : undefined;
  const confirmPasswordError = touched.confirmPassword ? errors.confirmPassword : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });
    if (errors.newPassword) {
      newPasswordRef.current?.focus();
      return;
    }
    if (errors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite({ token, newPassword: values.newPassword });
    } catch {
      setSubmitting(false);
      onLinkRejected();
      return;
    }
    showSuccessToast({ title: 'Lozinka postavljena', description: 'Sad se možeš prijaviti.', timeout: 5000 });
    await push('/login');
  }

  return (
    <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
      {email && <input autoComplete="username" hidden name="email" readOnly type="email" value={email} />}
      <FieldGroup className="gap-4">
        <Field data-invalid={newPasswordError ? true : undefined}>
          <FieldLabel htmlFor="set-password-new">Nova lozinka</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            autoFocus
            disabled={submitting}
            id="set-password-new"
            invalid={!!newPasswordError}
            name="newPassword"
            placeholder="Upiši novu lozinku"
            ref={newPasswordRef}
            value={values.newPassword}
            onBlur={() => setTouched((current) => ({ ...current, newPassword: true }))}
            onChange={(newPassword) => setValues((current) => ({ ...current, newPassword }))}
          />
          <PasswordChecklist rules={PASSWORD_RULES} value={values.newPassword} />
          {newPasswordError && <FieldError>{newPasswordError}</FieldError>}
        </Field>
        <Field data-invalid={confirmPasswordError ? true : undefined}>
          <FieldLabel htmlFor="set-password-confirm">Potvrda lozinke</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            disabled={submitting}
            id="set-password-confirm"
            invalid={!!confirmPasswordError}
            name="confirmPassword"
            placeholder="Ponovi lozinku"
            ref={confirmPasswordRef}
            value={values.confirmPassword}
            onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
            onChange={(confirmPassword) => setValues((current) => ({ ...current, confirmPassword }))}
          />
          {confirmPasswordError && <FieldError>{confirmPasswordError}</FieldError>}
        </Field>
      </FieldGroup>
      <Button className="w-full" loading={submitting} type="submit">
        Postavi lozinku
      </Button>
    </form>
  );
};
