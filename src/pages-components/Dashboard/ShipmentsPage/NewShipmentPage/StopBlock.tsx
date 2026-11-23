import dayjs from 'dayjs';
import * as React from 'react';

import { AsyncCombobox } from '@/components/shared/async-combobox';
import { CountryCombobox } from '@/components/shared/country-combobox';
import { CountryFlag } from '@/components/shared/country-flag';
import { DatePicker } from '@/components/shared/date-picker';
import { useDiscardGuard } from '@/components/shared/discard-changes';
import { STOP_KIND } from '@/components/shared/stop-kind';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getPostalCode, type PostalCode, searchPostalCodes } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getCountryName, getEuropeCountryOptions } from '@/lib/utils/countries';
import { formatDate } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { AiMark, ErrorText, Label, useNalogForm } from './form-context';
import { cargoLoadUnloadDatesMessage } from './schema';
import { type CargoValues, emptyStop, fieldDomId, type StopKind, type StopValues } from './values';

/** Per kind (lab /nalog-form `KIND`; today's typeLabelsMap). */
const KIND = {
  loading: {
    title: 'Detalji utovara',
    date: 'Spremno za utovar',
    add: 'Dodaj utovar',
    confirm: 'Potvrdi utovar',
    lower: 'utovar',
  },
  unloading: {
    title: 'Detalji istovara',
    date: 'Rok za istovar',
    add: 'Dodaj istovar',
    confirm: 'Potvrdi istovar',
    lower: 'istovar',
  },
} as const;

/** „10000, Zagreb” (today's option label) → its parts. */
function postalParts(label: string | undefined) {
  const [postalCode, ...place] = (label ?? '').split(', ');
  return { postalCode: postalCode ?? '', placeName: place.join(', ') };
}

const toDate = (value: string) => (value ? dayjs(value).toDate() : null);

/** Same stop on two tereta = same company, address and date (today's „Ili” select, lab „Kao Teret 1” chips). */
const stopId = (stop: StopValues) =>
  [stop.companyName, stop.address.streetName, stop.address.postalCodeId.value, stop.date].join('|');

function StopSummary({ stop, kind }: { stop: StopValues; kind: StopKind }) {
  const { postalCode, placeName } = postalParts(stop.address.postalCodeId.label);
  return (
    <span className="flex min-w-0 flex-col gap-0.5 text-sm">
      <span className="truncate font-medium">{stop.companyName || '—'}</span>
      <span className="truncate text-muted-foreground">{stop.address.streetName}</span>
      <span className="flex items-center gap-1.5">
        {stop.address.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
        {postalCode} {placeName}
      </span>
      <span className="text-xs text-muted-foreground">
        {KIND[kind].date}: {stop.date ? formatDate(stop.date) : '—'}
        {stop.reference && ` · Ref. ${stop.reference}`}
      </span>
      {stop.description && <span className="truncate text-xs text-muted-foreground">„{stop.description}”</span>}
    </span>
  );
}

/** Utovar / istovar of one teret: summary (click = edit), ✎ ×, or „Dodaj …” + copies of stops on other tereta. */
export function StopBlock({ cargo, kind }: { cargo: CargoValues; kind: StopKind }) {
  const { values, setCargo, errorOf, touch } = useNalogForm();
  const [editing, setEditing] = React.useState(false);
  const stop = cargo[kind];
  const field = `${cargo.key}.${kind}`;
  const error = errorOf(field);
  const meta = KIND[kind];

  // Stops already entered on other tereta: one click copies them without the reference (today's „Ili” select).
  const others = React.useMemo(() => {
    const seen = new Set<string>();
    return values.cargo.flatMap((other, otherIndex) =>
      other.key === cargo.key
        ? []
        : (['loading', 'unloading'] as const).flatMap((otherKind) => {
            const otherStop = other[otherKind];
            if (!otherStop?.address.streetName) return [];
            const id = stopId(otherStop);
            if (seen.has(id)) return [];
            seen.add(id);
            const place = postalParts(otherStop.address.postalCodeId.label).placeName;
            return [
              {
                stop: otherStop,
                label: `Teret ${otherIndex + 1} · ${KIND[otherKind].lower}${place ? ` · ${place}` : ''}`,
              },
            ];
          })
    );
  }, [values.cargo, cargo.key]);

  const save = (next: StopValues | null) => {
    setCargo(cargo.key, { [kind]: next }, field);
    touch(field);
  };

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border p-3',
        error && 'border-destructive/60',
        editing && 'border-primary/40 bg-muted/30'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn('flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase', STOP_KIND[kind].text)}
        >
          <Icon icon={STOP_KIND[kind].icon} size="s" /> {STOP_KIND[kind].label}
          <AiMark field={field} />
        </span>
        {stop && (
          <span className="flex">
            <Button aria-label={`Uredi ${meta.lower}`} size="icon-xs" variant="ghost" onClick={() => setEditing(true)}>
              <Icon icon="IconPencil" size="xs" />
            </Button>
            <Button
              aria-label={`Ukloni ${meta.lower}`}
              className="text-muted-foreground hover:text-destructive"
              size="icon-xs"
              variant="ghost"
              onClick={() => save(null)}
            >
              <Icon icon="IconX" size="xs" />
            </Button>
          </span>
        )}
      </div>
      {stop ? (
        <button className="min-w-0 text-left" id={fieldDomId(field)} type="button" onClick={() => setEditing(true)}>
          <StopSummary kind={kind} stop={stop} />
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            aria-invalid={error ? true : undefined}
            className="w-full"
            id={fieldDomId(field)}
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            <Icon data-icon="inline-start" icon="IconPlus" size="s" /> {meta.add}
          </Button>
          {others.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {others.map((other) => (
                <Button
                  className="text-muted-foreground"
                  key={other.label}
                  size="xs"
                  variant="ghost"
                  onClick={() => save({ ...other.stop, reference: '' })}
                >
                  <Icon data-icon="inline-start" icon="IconCopy" size="xs" /> Kao {other.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
      {editing && (
        <StopDialog
          cargo={cargo}
          kind={kind}
          stop={stop}
          onClose={() => {
            setEditing(false);
            touch(field);
          }}
          onSave={(next) => {
            save(next);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

type StopErrors = Partial<Record<'street' | 'country' | 'postal' | 'date', string>>;

/** The other date of the same teret: a utovar may not be after its istovar (today's CargoLoadModal rule). */
function dateError(kind: StopKind, date: string, cargo: CargoValues) {
  const other = kind === 'loading' ? cargo.unloading?.date : cargo.loading?.date;
  if (!date || !other) return undefined;
  const value = dayjs(date);
  const otherValue = dayjs(other);
  if (!value.isValid() || !otherValue.isValid()) return undefined;
  const wrong = kind === 'loading' ? value.isAfter(otherValue, 'day') : value.isBefore(otherValue, 'day');
  return wrong ? cargoLoadUnloadDatesMessage(kind, other) : undefined;
}

function validateStop(stop: StopValues, kind: StopKind, cargo: CargoValues): StopErrors {
  return {
    street: stop.address.streetName.trim() ? undefined : 'Upiši ulicu i broj.',
    // A postal code already says the country (an AI draft may come without one).
    country: stop.address.countryCode || stop.address.postalCodeId.value ? undefined : 'Odaberi državu.',
    postal: stop.address.postalCodeId.value ? undefined : 'Odaberi poštanski broj.',
    date: dateError(kind, stop.date, cargo),
  };
}

/**
 * Detalji utovara / istovara (lab /nalog-form stop dialog, today's CargoLoadModal fields): Tvrtka, Ulica i broj, Država
 * + Poštanski broj i mjesto (today's postal code search), date, Referenca, Napomena. Validated on blur and on
 * „Potvrdi”; closing a changed dialog asks first.
 */
function StopDialog({
  cargo,
  kind,
  stop,
  onSave,
  onClose,
}: {
  cargo: CargoValues;
  kind: StopKind;
  stop: StopValues | null;
  onSave(stop: StopValues): void;
  onClose(): void;
}) {
  const meta = KIND[kind];
  const [initial, setInitial] = React.useState<StopValues>(() => stop ?? emptyStop());
  const [draft, setDraft] = React.useState<StopValues>(initial);
  const [touched, setTouched] = React.useState<Partial<Record<keyof StopErrors, boolean>>>({});
  const [tried, setTried] = React.useState(false);
  const errors = validateStop(draft, kind, cargo);
  const show = (key: keyof StopErrors) => (touched[key] || tried ? errors[key] : undefined);
  const leave = (key: keyof StopErrors) => () => setTouched((current) => ({ ...current, [key]: true }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const guard = useDiscardGuard({ dirty, onClose });
  const id = (key: string) => `stop-${cargo.key}-${kind}-${key}`;

  const setAddress = (patch: Partial<StopValues['address']>) =>
    setDraft((current) => ({ ...current, address: { ...current.address, ...patch } }));

  // A postal code without a country (AI drafts): take the country from the postal code, so the search works too.
  const missingCountryFor = !draft.address.countryCode ? draft.address.postalCodeId.value : undefined;
  React.useEffect(() => {
    if (!missingCountryFor) return;
    let cancelled = false;
    getPostalCode(missingCountryFor).then(
      (postalCode) => {
        if (cancelled || !postalCode.countryCode) return;
        // Filled in, not typed: it doesn't make the dialog dirty.
        const withCountry = (value: StopValues) =>
          value.address.countryCode || value.address.postalCodeId.value !== missingCountryFor
            ? value
            : { ...value, address: { ...value.address, countryCode: postalCode.countryCode } };
        setInitial(withCountry);
        setDraft(withCountry);
      },
      () => undefined
    );
    return () => {
      cancelled = true;
    };
  }, [missingCountryFor]);

  const { postalCode, placeName } = postalParts(draft.address.postalCodeId.label);
  const postalValue: PostalCode | null = draft.address.postalCodeId.value
    ? { id: draft.address.postalCodeId.value, postalCode, placeName, countryCode: draft.address.countryCode }
    : null;

  function confirm() {
    if (Object.values(errors).some(Boolean)) {
      setTried(true);
      const first = (['street', 'country', 'postal', 'date'] as const).find((key) => errors[key]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    onSave({ ...draft, address: { ...draft.address, streetName: draft.address.streetName.trim() } });
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && guard.requestClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{meta.title}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-3">
            <Field>
              <Label htmlFor={id('company')}>Tvrtka</Label>
              <Input
                autoFocus
                id={id('company')}
                value={draft.companyName}
                onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))}
              />
            </Field>
            <Field data-invalid={show('street') ? true : undefined}>
              <Label htmlFor={id('street')}>Ulica i broj</Label>
              <Input
                aria-invalid={show('street') ? true : undefined}
                id={id('street')}
                value={draft.address.streetName}
                onBlur={leave('street')}
                onChange={(event) => setAddress({ streetName: event.target.value })}
              />
              <ErrorText>{show('street')}</ErrorText>
            </Field>
            <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <Field data-invalid={show('country') ? true : undefined}>
                <Label htmlFor={id('country')}>Država</Label>
                <CountryCombobox
                  countries={getEuropeCountryOptions()}
                  id={id('country')}
                  invalid={!!show('country')}
                  value={
                    draft.address.countryCode
                      ? { code: draft.address.countryCode, name: getCountryName(draft.address.countryCode) }
                      : null
                  }
                  onBlur={leave('country')}
                  onValueChange={(country) => {
                    const code = country?.code ?? '';
                    // A postal code belongs to one country.
                    if (code !== draft.address.countryCode) setAddress({ countryCode: code, postalCodeId: {} });
                  }}
                />
                <ErrorText>{show('country')}</ErrorText>
              </Field>
              <Field data-invalid={show('postal') ? true : undefined}>
                <Label htmlFor={id('postal')}>Poštanski broj i mjesto</Label>
                <AsyncCombobox<PostalCode>
                  disabled={!draft.address.countryCode}
                  getKey={(item) => item.id}
                  getLabel={(item) => [item.postalCode, item.placeName].filter(Boolean).join(' ')}
                  id={id('postal')}
                  invalid={!!show('postal')}
                  minChars={1}
                  noResults={(query) => `Nema poštanskog broja „${query}”.`}
                  placeholder={draft.address.countryCode ? 'Traži poštanski broj' : 'Prvo odaberi državu'}
                  renderItem={(item) => (
                    <span className="flex min-w-0 gap-2">
                      <span className="tabular-nums">{item.postalCode}</span>
                      <span className="truncate text-muted-foreground">{item.placeName}</span>
                    </span>
                  )}
                  search={(query) => searchPostalCodes(query, draft.address.countryCode)}
                  value={postalValue}
                  onBlur={leave('postal')}
                  onValueChange={(item) =>
                    setAddress({
                      postalCodeId: item ? { value: item.id, label: `${item.postalCode}, ${item.placeName}` } : {},
                    })
                  }
                />
                <ErrorText>{show('postal')}</ErrorText>
              </Field>
            </div>
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <Field data-invalid={show('date') ? true : undefined}>
                <Label htmlFor={id('date')}>{meta.date}</Label>
                <DatePicker
                  id={id('date')}
                  invalid={!!show('date')}
                  marked={otherDateMark(cargo, kind)}
                  value={toDate(draft.date)}
                  onBlur={leave('date')}
                  onChange={(date) => {
                    setDraft((current) => ({ ...current, date: date ? dayjs(date).format('YYYY-MM-DD') : '' }));
                    setTouched((current) => ({ ...current, date: true }));
                  }}
                />
                {show('date') ? <ErrorText>{show('date')}</ErrorText> : <OtherDateHint cargo={cargo} kind={kind} />}
              </Field>
              <Field>
                <Label htmlFor={id('reference')}>Referenca</Label>
                <Input
                  id={id('reference')}
                  value={draft.reference}
                  onChange={(event) => setDraft((current) => ({ ...current, reference: event.target.value }))}
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor={id('description')}>Napomena</Label>
              <Textarea
                id={id('description')}
                rows={2}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Odustani</DialogClose>
            <Button onClick={confirm}>{meta.confirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guard.discardDialog}
    </>
  );
}

/** Today's helper text under the date: the other date of this teret it has to respect. */
/** The other side's date as a dot in this picker: the utovar (orange) in the istovar's, the rok istovara (teal) in the utovar's. */
function otherDateMark(cargo: CargoValues, kind: StopKind) {
  const other = kind === 'loading' ? cargo.unloading?.date : cargo.loading?.date;
  const date = toDate(other ?? '');
  if (!date) return undefined;
  const otherKind = kind === 'loading' ? 'unloading' : 'loading';
  return {
    date,
    label: otherKind === 'loading' ? 'Utovar' : 'Rok istovara',
    dotClassName: STOP_KIND[otherKind].dot,
  };
}

function OtherDateHint({ cargo, kind }: { cargo: CargoValues; kind: StopKind }) {
  const other = kind === 'loading' ? cargo.unloading?.date : cargo.loading?.date;
  if (!other) return null;
  return (
    <FieldDescription>
      {kind === 'loading' ? 'Najkasnije' : 'Najranije'} {formatDate(other)} (
      {kind === 'loading' ? 'rok istovara' : 'utovar'})
    </FieldDescription>
  );
}
