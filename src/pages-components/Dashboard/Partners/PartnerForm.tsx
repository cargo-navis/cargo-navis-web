import * as React from 'react';

import { AsyncCombobox } from '@/components/shared/async-combobox';
import { CountryCombobox } from '@/components/shared/country-combobox';
import { Button } from '@/components/ui/button';
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
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import type { CompanyFormInitialValues } from '@/components/vies';
import { type PostalCode, searchPostalCodes } from '@/lib/api';
import { cn } from '@/lib/utils';
import { COMPANY_NAME_MAX_LENGTH } from '@/lib/utils/companies';
import { getCountryName, getEuropeCountryOptions } from '@/lib/utils/countries';
import { isValidEmail, normalizeEmail } from '@/lib/utils/notificationEmails';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import { type SavedPartner, useSavePartner } from './hooks';
import { type Partner, PARTNER_WORDS, type PartnerKind } from './partners';
import { ViesLookup, type ViesResult } from './ViesLookup';

interface Values {
  name: string;
  taxId: string;
  terms: string;
  email: string;
  street: string;
  countryCode: string;
  postalCode: PostalCode | null;
}

type Key = keyof Values;

// Field ids in the order the form shows them (the first invalid one gets focus).
const FIELD_ORDER: Key[] = ['name', 'taxId', 'terms', 'email', 'street', 'countryCode', 'postalCode'];
const fieldId = (kind: PartnerKind, key: Key) => `${kind}-${key}`;

const DEFAULT_COUNTRY = 'HR';

function fromPartner(partner: Partner): Values {
  return {
    name: partner.name,
    taxId: partner.taxId,
    terms: partner.termsOfPayment !== null ? String(partner.termsOfPayment) : '',
    email: partner.emails[0] ?? '',
    street: partner.street,
    countryCode: partner.countryCode,
    postalCode: partner.postalCode,
  };
}

/** Whatever is known up front (VIES, a draft's suggested client); the rest stays empty. */
function applyInitial(values: Values, initial: CompanyFormInitialValues): Values {
  const countryCode = initial.postalCode?.countryCode || initial.countryCode || values.countryCode;
  return {
    ...values,
    name: initial.name ?? values.name,
    taxId: initial.taxId ?? values.taxId,
    street: initial.addressName ?? values.street,
    countryCode,
    postalCode: initial.postalCode ?? (countryCode === values.countryCode ? values.postalCode : null),
  };
}

const EMPTY: Values = {
  name: '',
  taxId: '',
  terms: '',
  email: '',
  street: '',
  countryCode: DEFAULT_COUNTRY,
  postalCode: null,
};

function validate(values: Values, kind: PartnerKind, withEmail: boolean): Partial<Record<Key, string>> {
  const terms = values.terms.trim();
  return {
    name: !values.name.trim()
      ? 'Upiši naziv tvrtke.'
      : values.name.length > COMPANY_NAME_MAX_LENGTH
        ? `Najviše ${COMPANY_NAME_MAX_LENGTH} znakova.`
        : undefined,
    taxId: values.taxId.trim() ? undefined : 'Upiši porezni broj.',
    terms:
      terms && !/^\d+$/.test(terms)
        ? 'Upiši broj dana, npr. 30.'
        : kind === 'contractor' && !terms
          ? 'Upiši valutu plaćanja.'
          : undefined,
    email:
      withEmail && values.email.trim() && !isValidEmail(normalizeEmail(values.email))
        ? 'Upiši ispravnu email adresu.'
        : undefined,
    street: values.street.trim() ? undefined : 'Upiši ulicu i broj.',
    countryCode: values.countryCode ? undefined : 'Odaberi državu.',
    postalCode: values.postalCode ? undefined : 'Odaberi poštanski broj.',
  };
}

/**
 * Novi / Uredi klijenta or podvozara (lab /partners `PartnerForm`, decision „sections, buttons at the end”): Tvrtka
 * (Naziv, Porezni broj + Valuta plaćanja, Email) and Adresa sjedišta (Ulica, Država + Poštanski broj i mjesto).
 * New: „Popuni iz VIES-a” on top fills the form. Validation on blur and on submit; the primary button is always
 * enabled and jumps to the first problem (DECISIONS §2). Contractor: Valuta plaćanja is required.
 */
export function PartnerForm({
  kind,
  partner,
  initialValues,
  onSaved,
  onCancel,
  onDirtyChange,
}: {
  kind: PartnerKind;
  /** Edit this partner; without it the form creates one. */
  partner?: Partner;
  /** Prefill for a new partner (e.g. a draft's suggested client). */
  initialValues?: CompanyFormInitialValues;
  /** `id` is '' when a create returned no body (then go to the list). */
  onSaved(saved: SavedPartner): void;
  onCancel(): void;
  /** Reports whether anything differs from the starting values (a dialog asks „Odbaciti promjene?” then). */
  onDirtyChange?(dirty: boolean): void;
}) {
  const words = PARTNER_WORDS[kind];
  const isEdit = !!partner;
  const [initial] = React.useState<Values>(() =>
    partner ? fromPartner(partner) : initialValues ? applyInitial(EMPTY, initialValues) : EMPTY
  );
  const [values, setValues] = React.useState<Values>(initial);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  React.useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);
  const [touched, setTouched] = React.useState<Partial<Record<Key, boolean>>>({});
  const [triedToSave, setTriedToSave] = React.useState(false);
  const { mutateAsync: savePartner, isPending: saving } = useSavePartner(kind, partner?.id);

  // Client email = its first notification contact (new only; contacts are edited on the client page).
  const showEmail = kind === 'contractor' || !isEdit;
  const errors = validate(values, kind, showEmail);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const show = (key: Key) => (touched[key] || triedToSave ? errors[key] : undefined);
  const touch = (key: Key) => () => setTouched((current) => ({ ...current, [key]: true }));
  const set = <K extends Key>(key: K, value: Values[K]) => setValues((current) => ({ ...current, [key]: value }));
  const id = (key: Key) => fieldId(kind, key);
  const invalid = (key: Key) => (show(key) ? true : undefined);

  function handleVies(result: ViesResult) {
    if (result.kind === 'miss') {
      // Keep what the user typed; only fill an empty tax id.
      setValues((current) => (current.taxId ? current : { ...current, taxId: result.values.taxId ?? '' }));
      return;
    }
    setValues((current) => applyInitial(current, result.values));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (errorCount > 0) {
      setTriedToSave(true);
      const first = FIELD_ORDER.find((key) => errors[key]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    try {
      const saved = await savePartner({
        name: values.name.trim(),
        taxId: values.taxId.trim(),
        termsOfPayment: values.terms.trim() ? Number(values.terms.trim()) : null,
        addressName: values.street.trim(),
        addressPostalCodeId: values.postalCode!.id,
        email: showEmail ? normalizeEmail(values.email) : '',
      });
      showSuccessToast({ title: `${words.one} ${saved.name} ${isEdit ? 'ažuriran' : 'dodan'}` });
      onSaved(saved);
    } catch {
      showErrorToast({ title: `Dogodila se greška s unosom ${words.accusative}`, description: 'Pokušaj ponovno.' });
    }
  }

  const optional = <span className="font-normal text-muted-foreground">(neobavezno)</span>;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {!isEdit && <ViesLookup onResult={handleVies} />}
      <form className="flex flex-col gap-6" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <FieldSet>
          <FieldLegend className="font-heading font-bold tracking-tight">Tvrtka</FieldLegend>
          <FieldGroup className="gap-4">
            <Field data-invalid={invalid('name')}>
              <FieldLabel htmlFor={id('name')}>Naziv tvrtke</FieldLabel>
              <Input
                aria-invalid={invalid('name')}
                id={id('name')}
                value={values.name}
                onBlur={touch('name')}
                onChange={(event) => set('name', event.target.value)}
              />
              {show('name') && <FieldError>{show('name')}</FieldError>}
            </Field>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field data-invalid={invalid('taxId')}>
                <FieldLabel htmlFor={id('taxId')}>Porezni broj</FieldLabel>
                <Input
                  aria-invalid={invalid('taxId')}
                  id={id('taxId')}
                  value={values.taxId}
                  onBlur={touch('taxId')}
                  onChange={(event) => set('taxId', event.target.value)}
                />
                {show('taxId') && <FieldError>{show('taxId')}</FieldError>}
              </Field>
              <Field data-invalid={invalid('terms')}>
                <FieldLabel htmlFor={id('terms')}>Valuta plaćanja {kind === 'client' && optional}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    aria-invalid={invalid('terms')}
                    className="tabular-nums"
                    id={id('terms')}
                    inputMode="numeric"
                    placeholder="30"
                    value={values.terms}
                    onBlur={touch('terms')}
                    onChange={(event) => set('terms', event.target.value)}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>dana</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {show('terms') ? (
                  <FieldError>{show('terms')}</FieldError>
                ) : (
                  kind === 'contractor' && <FieldDescription>0 = plaćanje odmah</FieldDescription>
                )}
              </Field>
            </div>
            {showEmail && (
              <Field data-invalid={invalid('email')}>
                <FieldLabel htmlFor={id('email')}>
                  {kind === 'client' ? 'Email za obavijesti' : 'Email za račune'} {optional}
                </FieldLabel>
                <Input
                  aria-invalid={invalid('email')}
                  id={id('email')}
                  type="email"
                  value={values.email}
                  onBlur={touch('email')}
                  onChange={(event) => set('email', event.target.value)}
                />
                {show('email') ? (
                  <FieldError>{show('email')}</FieldError>
                ) : (
                  kind === 'client' && (
                    <FieldDescription>
                      Prvi kontakt za obavijesti o utovaru i istovaru. Ostale dodaješ na stranici klijenta.
                    </FieldDescription>
                  )
                )}
              </Field>
            )}
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend className="font-heading font-bold tracking-tight">Adresa sjedišta</FieldLegend>
          <FieldGroup className="gap-4">
            <Field data-invalid={invalid('street')}>
              <FieldLabel htmlFor={id('street')}>Ulica i broj</FieldLabel>
              <Input
                aria-invalid={invalid('street')}
                id={id('street')}
                value={values.street}
                onBlur={touch('street')}
                onChange={(event) => set('street', event.target.value)}
              />
              {show('street') && <FieldError>{show('street')}</FieldError>}
            </Field>
            <div className="grid items-start gap-4 sm:grid-cols-[1fr_2fr]">
              <Field data-invalid={invalid('countryCode')}>
                <FieldLabel htmlFor={id('countryCode')}>Država</FieldLabel>
                <CountryCombobox
                  countries={getEuropeCountryOptions()}
                  id={id('countryCode')}
                  invalid={!!show('countryCode')}
                  value={
                    values.countryCode ? { code: values.countryCode, name: getCountryName(values.countryCode) } : null
                  }
                  onBlur={touch('countryCode')}
                  onValueChange={(country) => {
                    const code = country?.code ?? '';
                    // A postal code belongs to one country.
                    setValues((current) =>
                      code === current.countryCode ? current : { ...current, countryCode: code, postalCode: null }
                    );
                  }}
                />
                {show('countryCode') && <FieldError>{show('countryCode')}</FieldError>}
              </Field>
              <Field data-invalid={invalid('postalCode')}>
                <FieldLabel htmlFor={id('postalCode')}>Poštanski broj i mjesto</FieldLabel>
                <AsyncCombobox<PostalCode>
                  disabled={!values.countryCode}
                  getKey={(item) => item.id}
                  getLabel={(item) => [item.postalCode, item.placeName].filter(Boolean).join(' ')}
                  id={id('postalCode')}
                  invalid={!!show('postalCode')}
                  minChars={1}
                  noResults={(query) => `Nema poštanskog broja „${query}”.`}
                  placeholder="Traži poštanski broj"
                  renderItem={(item) => (
                    <span className="flex min-w-0 gap-2">
                      <span className="tabular-nums">{item.postalCode}</span>
                      <span className="truncate text-muted-foreground">{item.placeName}</span>
                    </span>
                  )}
                  search={(query) => searchPostalCodes(query, values.countryCode)}
                  value={values.postalCode}
                  onBlur={touch('postalCode')}
                  onValueChange={(item) => set('postalCode', item)}
                />
                {show('postalCode') ? (
                  <FieldError>{show('postalCode')}</FieldError>
                ) : (
                  <FieldDescription>Iz popisa poštanskih brojeva odabrane države.</FieldDescription>
                )}
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>
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
              {isEdit ? 'Spremi promjene' : words.add}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
