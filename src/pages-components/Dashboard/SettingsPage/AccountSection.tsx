import Link from 'next/link';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { POSITION_LABELS } from '@/components/layout/DashboardLayout/nav';
import { Panel } from '@/components/shared/panel';
import { PASSWORD_RULES, PasswordChecklist, PasswordInput, passwordRuleError } from '@/components/shared/password';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { updatePassword } from '@/lib/api/user';
import type { User } from '@/lib/api/user.d';
import { usePushSubscriptions } from '@/lib/hooks/api/push-subscriptions';
import {
  isPushOptedOut,
  isPushSupported,
  registerPushSubscription,
  setPushOptedOut,
} from '@/lib/hooks/usePushNotificationSubscription';
import { initials } from '@/lib/utils/initials';
import { unsubscribePushOnLogout } from '@/lib/utils/session';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon, type IconType } from '@/ui';

/** Moj račun (lab /settings `AccountSection`): read-only profile, password, Ovaj uređaj. */
export function AccountSection({ user }: { user: User }) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <ProfilePanel user={user} />
      <PasswordPanel />
      <DevicePanel />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------------------------------------------------

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm break-words">{children}</span>
    </div>
  );
}

function ProfilePanel({ user }: { user: User }) {
  const name = user.fullName || `${user.firstName} ${user.lastName}`;

  return (
    <Panel
      action={
        <Button
          nativeButton={false}
          render={<Link href={`/dashboard/employees/${user.id}`} />}
          size="sm"
          variant="ghost"
        >
          Moj profil u Zaposlenicima <Icon data-icon="inline-end" icon="IconExternalLink" size="s" />
        </Button>
      }
      bodyClassName="py-1.5 divide-y"
      title="Profil"
    >
      <div className="flex items-center gap-3 py-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-muted-foreground">
          {initials(name)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-heading text-lg font-bold tracking-tight">{name}</span>
          {user.positions.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {user.positions.map((position) => (
                <Badge key={position} look="outline" size="sm">
                  {POSITION_LABELS[position] ?? position}
                </Badge>
              ))}
            </span>
          )}
        </div>
      </div>
      <Fact label="Email (prijava)">{user.email}</Fact>
      {user.phoneNumber && (
        <Fact label="Telefon">
          <span className="tabular-nums">{user.phoneNumber}</span>
        </Fact>
      )}
      <p className="py-2.5 text-xs text-muted-foreground">
        Ime, telefon i pozicije mijenja menadžer na stranici Zaposlenici. Email za prijavu ne može se promijeniti.
      </p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Lozinka
// ---------------------------------------------------------------------------------------------------------------------

function PasswordPanel() {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [touched, setTouched] = React.useState({ password: false, confirm: false });
  const [saving, setSaving] = React.useState(false);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const confirmRef = React.useRef<HTMLInputElement>(null);

  // Updated by the backend without the current password (updatePassword(newPassword)), like today.
  const passwordError = !password ? 'Nova lozinka je obavezna' : passwordRuleError(PASSWORD_RULES, password);
  const confirmError = !confirm
    ? 'Potvrda lozinke je obavezna'
    : confirm !== password
      ? 'Lozinke se ne podudaraju'
      : undefined;
  const showPasswordError = touched.password ? passwordError : undefined;
  const showConfirmError = touched.confirm ? confirmError : undefined;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ password: true, confirm: true });
    if (passwordError) {
      passwordRef.current?.focus();
      return;
    }
    if (confirmError) {
      confirmRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      await updatePassword(password);
      setPassword('');
      setConfirm('');
      setTouched({ password: false, confirm: false });
      showSuccessToast({ title: 'Lozinka promijenjena' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s ažuriranjem lozinke. Pokušajte ponovno.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="Lozinka">
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <FieldGroup className="gap-4">
          <Field data-invalid={showPasswordError ? true : undefined}>
            <FieldLabel htmlFor="settings-new-password">Nova lozinka</FieldLabel>
            <PasswordInput
              id="settings-new-password"
              invalid={!!showPasswordError}
              ref={passwordRef}
              value={password}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={setPassword}
            />
            <PasswordChecklist rules={PASSWORD_RULES} value={password} />
            {showPasswordError && <FieldError>{showPasswordError}</FieldError>}
          </Field>
          <Field data-invalid={showConfirmError ? true : undefined}>
            <FieldLabel htmlFor="settings-confirm-password">Ponovi novu lozinku</FieldLabel>
            <PasswordInput
              id="settings-confirm-password"
              invalid={!!showConfirmError}
              ref={confirmRef}
              value={confirm}
              onBlur={() => setTouched((current) => ({ ...current, confirm: true }))}
              onChange={setConfirm}
            />
            {showConfirmError && <FieldError>{showConfirmError}</FieldError>}
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
          <Button loading={saving} type="submit">
            Promijeni lozinku
          </Button>
        </div>
      </form>
    </Panel>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Ovaj uređaj
// ---------------------------------------------------------------------------------------------------------------------

const THEMES: { value: 'system' | 'light' | 'dark'; label: string; icon: IconType }[] = [
  { value: 'system', label: 'Sustav', icon: 'IconDeviceDesktop' },
  { value: 'light', label: 'Svijetla', icon: 'IconSun' },
  { value: 'dark', label: 'Tamna', icon: 'IconMoon' },
];

type PushState = 'loading' | 'unsupported' | 'blocked' | 'on' | 'off';

async function readPushState(): Promise<PushState> {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission !== 'granted' || isPushOptedOut()) return 'off';
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    return subscription ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

function DevicePanel() {
  // Same setting as Izgled in the user menu (next-themes, per browser).
  const { theme = 'system', setTheme } = useTheme();
  const [push, setPush] = React.useState<PushState>('loading');
  const [busy, setBusy] = React.useState(false);
  const { data: registered } = usePushSubscriptions();

  React.useEffect(() => {
    void readPushState().then(setPush);
  }, []);

  async function togglePush(on: boolean) {
    setBusy(true);
    try {
      if (on) {
        setPushOptedOut(false);
        const ok = await registerPushSubscription(registered);
        const state = await readPushState();
        setPush(ok ? 'on' : state);
        if (ok) showSuccessToast({ title: 'Obavijesti uključene' });
      } else {
        setPushOptedOut(true);
        await unsubscribePushOnLogout();
        setPush('off');
        showSuccessToast({ title: 'Obavijesti isključene' });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel bodyClassName="py-1.5 divide-y" title="Ovaj uređaj">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Izgled</span>
          <span className="text-xs text-muted-foreground">Samo u ovom pregledniku.</span>
        </div>
        <ButtonGroup>
          {THEMES.map(({ value, label, icon }) => (
            <Button
              key={value}
              size="sm"
              variant={theme === value ? 'secondary' : 'outline'}
              onClick={() => setTheme(value)}
            >
              <Icon data-icon="inline-start" icon={icon} size="s" /> {label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Icon className="text-muted-foreground" icon="IconBell" size="s" /> Obavijesti u pregledniku
            </span>
            <span className="text-xs text-muted-foreground">
              {push === 'unsupported'
                ? 'Ovaj preglednik ne podržava obavijesti.'
                : 'Upozorenja i obavijesti, i kad je aplikacija zatvorena.'}
            </span>
          </div>
          <Switch
            aria-label="Obavijesti u pregledniku"
            checked={push === 'on'}
            disabled={busy || push === 'loading' || push === 'blocked' || push === 'unsupported'}
            onCheckedChange={(on) => void togglePush(on)}
          />
        </div>
        {push === 'blocked' && (
          <Alert size="sm" variant="warning">
            <AlertDescription>
              Preglednik blokira obavijesti za ovu stranicu. Dopusti ih u postavkama preglednika (ikona lokota pored
              adrese).
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Panel>
  );
}
