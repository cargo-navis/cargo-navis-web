import { useRouter } from 'next/router';
import * as React from 'react';

import { PasswordInput } from '@/components/shared/password';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/lib/hooks/api/auth';

import type { FormValues } from './types';
import { LOGIN_FAILED_MESSAGE, validateLogin } from './validation';

/**
 * Validates on blur and on submit (DECISIONS §2); the button is always enabled and jumps to the first problem.
 * Logged in: `onLeave` plays the page's leave animation (the dashboard is prefetched meanwhile), then the dashboard.
 */
export const LoginForm = ({ onLeave }: { onLeave?: () => Promise<void> }) => {
  const { prefetch, push } = useRouter();
  const { loginUser } = useLogin();

  const [values, setValues] = React.useState<FormValues>({ email: '', password: '' });
  const [touched, setTouched] = React.useState({ email: false, password: false });
  const [submitting, setSubmitting] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const errors = validateLogin(values);
  const emailError = touched.email ? errors.email : undefined;
  const passwordError = touched.password ? errors.password : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }

    setFailed(false);
    setSubmitting(true);
    try {
      await loginUser({ ...values });
    } catch {
      setFailed(true);
      setSubmitting(false);
      return;
    }
    // Stays loading until the dashboard is there.
    await Promise.all([onLeave?.(), prefetch('/dashboard').catch(() => undefined)]);
    await push('/dashboard');
  }

  return (
    <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        <Field data-invalid={emailError ? true : undefined}>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            aria-invalid={emailError ? true : undefined}
            autoComplete="username"
            autoFocus
            disabled={submitting}
            id="login-email"
            inputMode="email"
            name="email"
            placeholder="Upiši svoj email"
            ref={emailRef}
            type="email"
            value={values.email}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          />
          {emailError && <FieldError className="sr-only">{emailError}</FieldError>}
        </Field>
        <Field data-invalid={passwordError ? true : undefined}>
          <FieldLabel htmlFor="login-password">Lozinka</FieldLabel>
          <PasswordInput
            autoComplete="current-password"
            disabled={submitting}
            id="login-password"
            invalid={!!passwordError}
            name="password"
            placeholder="Upiši svoju lozinku"
            ref={passwordRef}
            value={values.password}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChange={(password) => setValues((current) => ({ ...current, password }))}
          />
          {passwordError && <FieldError className="sr-only">{passwordError}</FieldError>}
        </Field>
      </FieldGroup>
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>{LOGIN_FAILED_MESSAGE}</AlertDescription>
        </Alert>
      )}
      <Button className="w-full" loading={submitting} type="submit">
        Prijavi se
      </Button>
    </form>
  );
};
