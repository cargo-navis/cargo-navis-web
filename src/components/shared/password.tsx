import * as React from 'react';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

export interface PasswordRule {
  /** Checklist line, e.g. „Najmanje 10 znakova”. */
  label: string;
  test(value: string): boolean;
  /** Field error when this is the first rule that fails. */
  error: string;
}

/** Moj račun: 10+ characters, an upper- and a lowercase letter, a digit. */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: 'Najmanje 10 znakova',
    test: (value) => value.length >= 10,
    error: 'Lozinka mora imati najmanje 10 znakova',
  },
  {
    label: 'Veliko slovo',
    test: (value) => /[A-Z]/.test(value),
    error: 'Lozinka mora sadržavati najmanje jedno veliko slovo',
  },
  {
    label: 'Malo slovo',
    test: (value) => /[a-z]/.test(value),
    error: 'Lozinka mora sadržavati najmanje jedno malo slovo',
  },
  {
    label: 'Znamenka',
    test: (value) => /[0-9]/.test(value),
    error: 'Lozinka mora sadržavati najmanje jednu znamenku',
  },
];

/** The first failing rule's error, or undefined when every rule passes. */
export function passwordRuleError(rules: PasswordRule[], value: string) {
  return rules.find((rule) => !rule.test(value))?.error;
}

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  value: string;
  onChange(value: string): void;
  invalid?: boolean;
};

/** Password field with a show / hide eye (InputGroup). Pass `autoComplete` (default `new-password`). */
export function PasswordInput({ invalid, autoComplete = 'new-password', onChange, ...props }: PasswordInputProps) {
  const [shown, setShown] = React.useState(false);
  return (
    <InputGroup>
      <InputGroupInput
        aria-invalid={invalid || undefined}
        autoComplete={autoComplete}
        type={shown ? 'text' : 'password'}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={shown ? 'Sakrij lozinku' : 'Prikaži lozinku'}
          disabled={props.disabled}
          size="icon-sm"
          onClick={() => setShown(!shown)}
        >
          <Icon icon={shown ? 'IconEyeOff' : 'IconEye'} size="m" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

/** Live checklist under a new-password field: every rule visible from the start, ticked while typing. */
export function PasswordChecklist({ rules, value }: { rules: PasswordRule[]; value: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-xs">
      {rules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            className={cn('flex items-center gap-1.5', ok ? 'text-success' : 'text-muted-foreground')}
            key={rule.label}
          >
            <Icon
              className={cn('size-3.5! [&_svg]:size-full!', !ok && 'opacity-50')}
              icon={ok ? 'IconCheck' : 'IconCircle'}
              size="xs"
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
