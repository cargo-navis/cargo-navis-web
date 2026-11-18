import dayjs from 'dayjs';
import * as React from 'react';

import { CountryCombobox } from '@/components/shared/country-combobox';
import { CountryFlag } from '@/components/shared/country-flag';
import { DatePicker } from '@/components/shared/date-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { type DriverLicenceEnum, GenderEnum, MessageChannelEnum, PositionEnum } from '@/lib/api/employees';
import type { CreateEmployeeParams, Employee } from '@/lib/api/employees.d';
import { useCreateEmployee, useUpdateEmployee } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { getCountryName } from '@/lib/utils/countries';
import { formatExpiry, getExpiryState } from '@/lib/utils/date';
import { isValidEmail } from '@/lib/utils/notificationEmails';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import {
  fullName,
  LICENCES,
  POSITION_LABEL,
  POSITION_ORDER,
} from '@/pages-components/Dashboard/EmployeesPage/employees';

import { joinPhoneNumber, PHONE_PREFIXES, type PhoneValue, splitPhoneNumber } from './utils';

type DateField =
  | 'dateOfBirth'
  | 'contractExpiryDate'
  | 'governmentIdExpiryDate'
  | 'driverLicenceExpiryDate'
  | 'professionalDriverLicenceExpiryDate'
  | 'driverTachographCardExpiryDate'
  | 'adrExpiryDate'
  | 'code95ExpiryDate'
  | 'medicalExaminationExpiryDate'
  | 'visaExpiryDate'
  | 'postingDeclarationExpiryDate';

type TextField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'residenceAddress'
  | 'governmentId'
  | 'driverLicenceId'
  | 'driverTachographCardId';

interface Values extends Record<DateField | TextField, string> {
  gender: string;
  nationality: string;
  phone: PhoneValue;
  whatsapp: boolean;
  positions: PositionEnum[];
  driverLicenceCategories: DriverLicenceEnum[];
}

const DATE_FIELDS: DateField[] = [
  'dateOfBirth',
  'contractExpiryDate',
  'governmentIdExpiryDate',
  'driverLicenceExpiryDate',
  'professionalDriverLicenceExpiryDate',
  'driverTachographCardExpiryDate',
  'adrExpiryDate',
  'code95ExpiryDate',
  'medicalExaminationExpiryDate',
  'visaExpiryDate',
  'postingDeclarationExpiryDate',
];
const TEXT_FIELDS: TextField[] = [
  'firstName',
  'lastName',
  'email',
  'residenceAddress',
  'governmentId',
  'driverLicenceId',
  'driverTachographCardId',
];

type ErrorKey = 'firstName' | 'lastName' | 'gender' | 'phone' | 'email' | 'positions';
// Field ids in the order the form shows them (the first invalid one gets focus).
const FIELD_IDS: Record<ErrorKey, string> = {
  firstName: 'e-first',
  lastName: 'e-last',
  gender: 'e-gender',
  phone: 'e-phone',
  email: 'e-email',
  positions: 'e-position-driver',
};

const DEFAULT_PREFIX = PHONE_PREFIXES[0].prefix;

function toValues(employee: Employee | undefined, startPositions: PositionEnum[]): Values {
  const dates = Object.fromEntries(DATE_FIELDS.map((key) => [key, employee?.[key] ?? ''])) as Record<DateField, string>;
  const texts = Object.fromEntries(TEXT_FIELDS.map((key) => [key, employee?.[key] ?? ''])) as Record<TextField, string>;
  const phone = employee?.phoneNumber
    ? // An unknown prefix (+49, +420 …) stays in the number as typed, with no prefix picked.
      (splitPhoneNumber(employee.phoneNumber) ?? { countryCode: '', phoneNumber: employee.phoneNumber })
    : { countryCode: DEFAULT_PREFIX, phoneNumber: '' };
  return {
    ...dates,
    ...texts,
    gender: employee?.gender ?? '',
    nationality: employee?.nationality ?? '',
    phone,
    whatsapp: employee?.messageChannel === MessageChannelEnum.WHATSAPP,
    positions: employee?.positions ?? startPositions,
    driverLicenceCategories: employee?.driverLicenceCategories ?? [],
  };
}

function validate(values: Values, initial: Values): Partial<Record<ErrorKey, string>> {
  const digits = values.phone.phoneNumber.replace(/\D/g, '');
  // A stored number is checked only once it changes (old records may not fit today's format).
  const phoneChanged = JSON.stringify(values.phone) !== JSON.stringify(initial.phone);
  return {
    firstName: values.firstName.trim() ? undefined : 'Upiši ime.',
    lastName: values.lastName.trim() ? undefined : 'Upiši prezime.',
    gender: values.gender ? undefined : 'Odaberi spol.',
    phone: !digits
      ? 'Upiši broj telefona.'
      : phoneChanged && (!/^\+?[\d\s/()-]+$/.test(values.phone.phoneNumber.trim()) || digits.length < 6)
        ? 'Broj u obliku 91 234 5678.'
        : phoneChanged && !values.phone.countryCode && !values.phone.phoneNumber.trim().startsWith('+')
          ? 'Odaberi pozivni broj ili upiši broj s +.'
          : undefined,
    email: values.email.trim() && !isValidEmail(values.email.trim()) ? 'Upiši ispravnu email adresu.' : undefined,
    positions: values.positions.length ? undefined : 'Odaberi barem jednu poziciju.',
  };
}

/** What the API gets: '' → null, phone joined, WhatsApp → messageChannel. */
function toPayload(values: Values): CreateEmployeeParams {
  const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());
  const payload: Record<string, unknown> = {
    ...Object.fromEntries([...DATE_FIELDS, ...TEXT_FIELDS].map((key) => [key, blankToNull(values[key])])),
    gender: values.gender as GenderEnum,
    nationality: values.nationality || null,
    phoneNumber: joinPhoneNumber(values.phone),
    messageChannel: values.whatsapp ? MessageChannelEnum.WHATSAPP : null,
    positions: values.positions,
    driverLicenceCategories: values.driverLicenceCategories,
  };
  return payload as CreateEmployeeParams;
}

const parseDate = (value: string) => (value ? dayjs(value).toDate() : null);
const toIso = (date: Date | null) => (date ? dayjs(date).format('YYYY-MM-DD') : '');

/** Date field with the warning on the label row (no layout shift): „Isteklo prije 8 d” / „Istječe za 18 d”. */
function ExpiryField({
  id,
  label,
  value,
  warn = true,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  warn?: boolean;
  onChange(value: string): void;
}) {
  const state = warn ? getExpiryState(value || null) : 'missing';
  const hint = state === 'expired' || state === 'soon' ? formatExpiry(value) : null;
  return (
    <Field>
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {hint && (
          <span
            className={cn(
              'text-xs font-medium whitespace-nowrap',
              state === 'expired' ? 'text-destructive' : 'text-amber-700 dark:text-amber-400'
            )}
          >
            {hint}
          </span>
        )}
      </div>
      <DatePicker
        id={id}
        placeholder={warn ? 'Vrijedi do' : 'Odaberi datum'}
        value={parseDate(value)}
        onChange={(date) => onChange(toIso(date))}
      />
    </Field>
  );
}

function PhoneField({
  value,
  invalid,
  onChange,
  onBlur,
}: {
  value: PhoneValue;
  invalid: boolean;
  onChange(value: PhoneValue): void;
  onBlur(): void;
}) {
  const known = PHONE_PREFIXES.find((option) => option.prefix === value.countryCode);
  return (
    <InputGroup>
      <InputGroupAddon>
        <DropdownMenu>
          <DropdownMenuTrigger render={<InputGroupButton aria-label="Pozivni broj" size="xs" />}>
            {known && <CountryFlag code={known.code} size="xs" />}{' '}
            {value.countryCode || <span className="text-muted-foreground">—</span>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            {PHONE_PREFIXES.map((option) => (
              <DropdownMenuItem key={option.prefix} onClick={() => onChange({ ...value, countryCode: option.prefix })}>
                <CountryFlag code={option.code} size="xs" /> {option.prefix}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
      <InputGroupInput
        aria-invalid={invalid || undefined}
        autoComplete="tel-national"
        id={FIELD_IDS.phone}
        inputMode="tel"
        placeholder="91 234 5678"
        type="tel"
        value={value.phoneNumber}
        onBlur={onBlur}
        onChange={(event) => onChange({ ...value, phoneNumber: event.target.value })}
      />
    </InputGroup>
  );
}

const EMAIL_TAKEN = 'com.scalesoft.cargonavis.domain.EmailAlreadyExistException';
const ACCOUNT_TAKEN = 'Account with the same email or phone number already exists';

/**
 * Novi / Uredi zaposlenika (lab /employees `EmployeeForm`): Osobni podaci, Kontakt, Posao, and Vozač only when
 * „Vozač” is ticked. Validation on blur and on submit; the primary button is always enabled and jumps to the first
 * problem (DECISIONS §2). Edit sends only what changed (today's PATCH).
 */
export function EmployeeForm({
  employee,
  startPositions = [PositionEnum.Driver],
  onSaved,
  onCancel,
}: {
  employee?: Employee;
  /** New only: positions ticked at the start („Dodaj vozača” / „Dodaj nekoga iz ureda”). */
  startPositions?: PositionEnum[];
  onSaved(employee: Employee): void;
  onCancel(): void;
}) {
  const isEdit = !!employee;
  const [initial] = React.useState(() => toValues(employee, startPositions));
  const [values, setValues] = React.useState(initial);
  const [touched, setTouched] = React.useState<Partial<Record<ErrorKey, boolean>>>({});
  const [triedToSave, setTriedToSave] = React.useState(false);
  const { mutateAsync: createEmployee, isPending: creating } = useCreateEmployee();
  const { mutateAsync: updateEmployee, isPending: updating } = useUpdateEmployee(employee?.id ?? '');
  const saving = creating || updating;

  const errors = validate(values, initial);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const show = (key: ErrorKey) => (touched[key] || triedToSave ? errors[key] : undefined);
  const invalid = (key: ErrorKey) => (show(key) ? true : undefined);
  const touch = (key: ErrorKey) => () => setTouched((current) => ({ ...current, [key]: true }));
  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const text = (key: TextField) => ({
    value: values[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => set(key, event.target.value),
  });
  const date = (key: DateField) => ({ value: values[key], onChange: (value: string) => set(key, value) });
  const showDriver = values.positions.includes(PositionEnum.Driver);
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (errorCount > 0) {
      setTriedToSave(true);
      const first = (Object.keys(FIELD_IDS) as ErrorKey[]).find((key) => errors[key]);
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    const payload = toPayload(values);
    try {
      if (employee) {
        // PATCH: only what changed.
        const before = toPayload(initial);
        const changed = Object.fromEntries(
          Object.entries(payload).filter(
            ([key, value]) => JSON.stringify(value) !== JSON.stringify(before[key as keyof CreateEmployeeParams])
          )
        );
        const saved = Object.keys(changed).length ? await updateEmployee(changed) : employee;
        showSuccessToast({ title: 'Zaposlenik spremljen', description: fullName(values) });
        onSaved(saved ?? employee);
      } else {
        const saved = await createEmployee(payload);
        showSuccessToast({ title: 'Zaposlenik dodan', description: fullName(values) });
        onSaved(saved);
      }
    } catch (error: any) {
      const message = error?.response?.data?.error;
      if (message === EMAIL_TAKEN) showErrorToast({ title: `Korisnik s email adresom „${values.email}” već postoji` });
      else if (message === ACCOUNT_TAKEN)
        showErrorToast({ title: 'Korisnik s ovom email adresom ili telefonom već postoji' });
      else showErrorToast({ title: 'Greška s unosom zaposlenika. Pokušajte ponovno.' });
    }
  }

  const optional = <span className="font-normal text-muted-foreground">(neobavezno)</span>;

  return (
    <form className="flex w-full max-w-3xl flex-col gap-8" noValidate onSubmit={(event) => void handleSubmit(event)}>
      <FieldSet>
        <FieldLegend className="font-heading font-bold tracking-tight">Osobni podaci</FieldLegend>
        <FieldGroup className="gap-4">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field data-invalid={invalid('firstName')}>
              <FieldLabel htmlFor={FIELD_IDS.firstName}>Ime</FieldLabel>
              <Input
                aria-invalid={invalid('firstName')}
                id={FIELD_IDS.firstName}
                onBlur={touch('firstName')}
                {...text('firstName')}
              />
              {show('firstName') && <FieldError>{show('firstName')}</FieldError>}
            </Field>
            <Field data-invalid={invalid('lastName')}>
              <FieldLabel htmlFor={FIELD_IDS.lastName}>Prezime</FieldLabel>
              <Input
                aria-invalid={invalid('lastName')}
                id={FIELD_IDS.lastName}
                onBlur={touch('lastName')}
                {...text('lastName')}
              />
              {show('lastName') && <FieldError>{show('lastName')}</FieldError>}
            </Field>
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <Field data-invalid={invalid('gender')}>
              <FieldLabel htmlFor={FIELD_IDS.gender}>Spol</FieldLabel>
              <NativeSelect
                aria-invalid={invalid('gender')}
                className="w-full"
                id={FIELD_IDS.gender}
                value={values.gender}
                onBlur={touch('gender')}
                onChange={(event) => set('gender', event.target.value)}
              >
                <NativeSelectOption disabled value="">
                  Odaberi
                </NativeSelectOption>
                <NativeSelectOption value={GenderEnum.Male}>Muški</NativeSelectOption>
                <NativeSelectOption value={GenderEnum.Female}>Ženski</NativeSelectOption>
              </NativeSelect>
              {show('gender') && <FieldError>{show('gender')}</FieldError>}
            </Field>
            <ExpiryField id="e-birth" label="Datum rođenja" warn={false} {...date('dateOfBirth')} />
            <Field>
              <FieldLabel htmlFor="e-nat">Državljanstvo</FieldLabel>
              <CountryCombobox
                id="e-nat"
                value={
                  values.nationality ? { code: values.nationality, name: getCountryName(values.nationality) } : null
                }
                onValueChange={(country) => set('nationality', country?.code ?? '')}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="e-address">Adresa stanovanja</FieldLabel>
            <Input id="e-address" {...text('residenceAddress')} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend className="font-heading font-bold tracking-tight">Kontakt</FieldLegend>
        <FieldGroup className="gap-4">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field data-invalid={invalid('phone')}>
              <FieldLabel htmlFor={FIELD_IDS.phone}>Telefon</FieldLabel>
              <PhoneField
                invalid={!!show('phone')}
                value={values.phone}
                onBlur={touch('phone')}
                onChange={(phone) =>
                  setValues((current) => ({
                    ...current,
                    phone,
                    // No number, no WhatsApp (today's rule).
                    whatsapp: phone.phoneNumber.trim() ? current.whatsapp : false,
                  }))
                }
              />
              {/* The error takes the description's place: same line, nothing moves. */}
              {show('phone') ? (
                <FieldError>{show('phone')}</FieldError>
              ) : (
                <FieldDescription>Na ovaj broj ide pozivnica za aplikaciju.</FieldDescription>
              )}
              <label className="flex items-center gap-2 pt-1 text-sm">
                <Switch
                  checked={values.whatsapp}
                  disabled={!values.phone.phoneNumber.trim()}
                  onCheckedChange={(checked) => set('whatsapp', checked)}
                />
                Šalji poruke na WhatsApp
              </label>
            </Field>
            <Field data-invalid={invalid('email')}>
              <FieldLabel htmlFor={FIELD_IDS.email}>Email {optional}</FieldLabel>
              <Input
                aria-invalid={invalid('email')}
                id={FIELD_IDS.email}
                type="email"
                onBlur={touch('email')}
                {...text('email')}
              />
              {show('email') && <FieldError>{show('email')}</FieldError>}
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend className="font-heading font-bold tracking-tight">Posao</FieldLegend>
        <FieldGroup className="gap-4">
          <Field data-invalid={invalid('positions')}>
            <FieldLabel>Pozicije</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {POSITION_ORDER.map((position) => {
                const checked = values.positions.includes(position);
                return (
                  <label
                    className={cn(
                      'flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm',
                      checked && 'border-primary/50 bg-teal-50 dark:bg-teal-900/40'
                    )}
                    key={position}
                  >
                    <Checkbox
                      checked={checked}
                      id={`e-position-${position}`}
                      onCheckedChange={() => {
                        set('positions', toggle(values.positions, position));
                        touch('positions')();
                      }}
                    />
                    {POSITION_LABEL[position]}
                  </label>
                );
              })}
            </div>
            {show('positions') && <FieldError>{show('positions')}</FieldError>}
          </Field>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <ExpiryField id="e-contract" label="Ugovor o radu vrijedi do" {...date('contractExpiryDate')} />
          </div>
        </FieldGroup>
      </FieldSet>

      {showDriver && (
        <FieldSet>
          <FieldLegend className="font-heading font-bold tracking-tight">Vozač</FieldLegend>
          <FieldDescription>
            Datumi se prate: na popisu i na profilu vidi se što je isteklo ili uskoro istječe.
          </FieldDescription>
          <FieldGroup className="gap-4">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="e-id">Broj osobne / putovnice</FieldLabel>
                <Input id="e-id" {...text('governmentId')} />
              </Field>
              <ExpiryField id="e-id-exp" label="Vrijedi do" {...date('governmentIdExpiryDate')} />
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="e-lic">Broj vozačke dozvole</FieldLabel>
                <Input id="e-lic" {...text('driverLicenceId')} />
              </Field>
              <Field>
                <FieldLabel>Kategorije</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {LICENCES.map((licence) => {
                    const held = values.driverLicenceCategories.includes(licence);
                    return (
                      <Button
                        aria-pressed={held}
                        className={cn('font-mono', held && 'border-primary/50')}
                        key={licence}
                        size="sm"
                        type="button"
                        variant={held ? 'secondary' : 'outline'}
                        onClick={() => set('driverLicenceCategories', toggle(values.driverLicenceCategories, licence))}
                      >
                        {licence}
                      </Button>
                    );
                  })}
                </div>
              </Field>
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <ExpiryField id="e-lic-exp" label="Vozačka vrijedi do" {...date('driverLicenceExpiryDate')} />
              <ExpiryField
                id="e-prof-exp"
                label="Profesionalna vrijedi do"
                {...date('professionalDriverLicenceExpiryDate')}
              />
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="e-tacho">Broj tahografske kartice</FieldLabel>
                <Input id="e-tacho" {...text('driverTachographCardId')} />
              </Field>
              <ExpiryField id="e-tacho-exp" label="Vrijedi do" {...date('driverTachographCardExpiryDate')} />
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-3">
              <ExpiryField id="e-adr" label="ADR" {...date('adrExpiryDate')} />
              <ExpiryField id="e-c95" label="Kod 95" {...date('code95ExpiryDate')} />
              <ExpiryField id="e-med" label="Liječnički pregled" {...date('medicalExaminationExpiryDate')} />
              <ExpiryField id="e-visa" label="Radna dozvola / viza" {...date('visaExpiryDate')} />
              <ExpiryField id="e-post" label="Izjava o upućivanju" {...date('postingDeclarationExpiryDate')} />
            </div>
          </FieldGroup>
        </FieldSet>
      )}

      {/* Sticky bottom bar (DECISIONS §2 page-level forms): summary left, Odustani + primary right. */}
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t bg-background py-3">
        <span className={cn('text-sm', triedToSave && errorCount > 0 ? 'text-destructive' : 'sr-only')}>
          {triedToSave && errorCount > 0
            ? `${errorCount} ${plural(errorCount, ['polje treba', 'polja trebaju', 'polja treba'])} ispraviti`
            : ''}
        </span>
        <div className="ml-auto flex gap-2">
          <Button disabled={saving} type="button" variant="ghost" onClick={onCancel}>
            Odustani
          </Button>
          <Button loading={saving} type="submit">
            {isEdit ? 'Spremi promjene' : 'Dodaj zaposlenika'}
          </Button>
        </div>
      </div>
    </form>
  );
}
