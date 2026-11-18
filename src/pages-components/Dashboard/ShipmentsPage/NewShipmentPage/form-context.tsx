import * as React from 'react';

import { FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Client, Contractor } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

import { type CargoValues, cleanNumberInput, fieldDomId, type NalogValues } from './values';

/** The Nalog form's state, shared by its sections (lab /nalog-form `FormContext`). */
export interface NalogFormApi {
  values: NalogValues;
  tenantId: string;
  clients: Client[];
  contractors: Contractor[];
  /** Change top-level fields; `field` clears that field's ✦. */
  set(patch: Partial<NalogValues>, field?: string): void;
  /** Change one teret (LDM follows until typed); `field` clears that field's ✦. */
  setCargo(key: string, patch: Partial<CargoValues>, field?: string): void;
  /** The field's problem, once it was left (blur) or after a save attempt (DECISIONS §2). */
  errorOf(field: string): string | undefined;
  /** Marks a field as left: its problem shows from now on. */
  touch(field: string): void;
  /** ✦ = filled by AI from the draft, until changed. */
  ai: Set<string>;
  /** Where the draft came from, for the ✦ wording: „iz emaila” / „iz dokumenta”. */
  aiSource: 'emaila' | 'dokumenta';
}

const NalogFormContext = React.createContext<NalogFormApi | null>(null);

export const NalogFormProvider = NalogFormContext.Provider;

export function useNalogForm() {
  const context = React.useContext(NalogFormContext);
  if (!context) throw new Error('useNalogForm must be used within the Nalog form');
  return context;
}

/** ✦ = this value was read by AI from the draft (email or uploaded document); disappears once the field is changed. */
export function AiMark({ field }: { field: string }) {
  const { ai, aiSource } = useNalogForm();
  if (!ai.has(field)) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span aria-label={`Iz ${aiSource}`} className="inline-flex text-agency-600 dark:text-agency-400" />}
      >
        <Icon className="size-3.5! [&_svg]:size-full!" icon="IconSparkles" size="xs" />
      </TooltipTrigger>
      <TooltipContent>Pročitano iz {aiSource} — provjeri</TooltipContent>
    </Tooltip>
  );
}

/** Label row: the label (+ ✦) on the left, a short hint („izračunato”) on the right, so nothing below moves. */
export function Label({
  htmlFor,
  field,
  hint,
  children,
}: {
  htmlFor?: string;
  field?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-5 items-baseline justify-between gap-2">
      <FieldLabel className="flex items-center gap-1.5" htmlFor={htmlFor}>
        {children}
        {field && <AiMark field={field} />}
      </FieldLabel>
      {hint && <span className="text-xs whitespace-nowrap text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function ErrorText({ children }: { children?: string }) {
  return children ? <FieldError>{children}</FieldError> : null;
}

/** Number field: empty when unknown, the unit inside the field; keeps what is typed („13,6”). */
export function NumberInput({
  field,
  value,
  onChange,
  unit,
  decimal = true,
  invalid,
  onBlur,
  className,
}: {
  /** Form field key; its DOM id comes from it. */
  field: string;
  value: string;
  onChange(value: string): void;
  unit?: string;
  decimal?: boolean;
  invalid?: boolean;
  onBlur?(): void;
  className?: string;
}) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        aria-invalid={invalid || undefined}
        autoComplete="off"
        className="tabular-nums"
        id={fieldDomId(field)}
        inputMode={decimal ? 'decimal' : 'numeric'}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(cleanNumberInput(event.target.value, { decimal }))}
      />
      {unit && (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{unit}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

/** A form choice as radio cards (DECISIONS §2: dot + petrol border / tint + one line of meaning). */
export function ChoiceCards<Key extends string>({
  label,
  value,
  onChange,
  options,
  size = 'default',
}: {
  label: string;
  value: Key;
  onChange(value: Key): void;
  options: { key: Key; label: string; description?: string; icon?: IconType }[];
  size?: 'default' | 'sm';
}) {
  return (
    <RadioGroup
      aria-label={label}
      className="grid-cols-1 gap-2 sm:grid-cols-2"
      value={value}
      onValueChange={(next) => onChange(next as Key)}
    >
      {options.map((option) => {
        const checked = value === option.key;
        return (
          <label
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border px-3 transition-colors',
              size === 'sm' ? 'py-2' : 'py-2.5',
              checked ? 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/15' : 'hover:bg-muted/50'
            )}
            key={option.key}
          >
            <RadioGroupItem className="mt-0.5" value={option.key} />
            <span className="flex min-w-0 flex-col">
              <span className={cn('flex items-center gap-1.5 text-sm', checked && 'font-medium')}>
                {option.icon && <Icon className="text-muted-foreground" icon={option.icon} size="s" />}
                {option.label}
              </span>
              {option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

/** Section title row inside the form (lab `Section`). */
export function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold tracking-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Small text button under a field („+ Novi klijent”). */
export function FieldLink({ children, onClick }: { children: React.ReactNode; onClick(): void }) {
  return (
    <button
      className="w-fit text-xs text-muted-foreground hover:text-foreground focus-visible:text-foreground"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
