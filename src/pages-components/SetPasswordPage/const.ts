import type { PasswordRule } from '@/components/shared/password';

export const INVALID_LINK_MESSAGE =
  'Ovaj link nije valjan ili je istekao. Zamolite administratora da vam pošalje novi poziv.';

/** Invite link password: only the length, as before (Moj račun asks for more: PASSWORD_RULES). */
export const SET_PASSWORD_RULES: PasswordRule[] = [
  {
    label: 'Najmanje 8 znakova',
    test: (value) => value.length >= 8,
    error: 'Lozinka mora imati najmanje 8 znakova',
  },
];
