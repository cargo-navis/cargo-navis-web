import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import * as React from 'react';

import { DatePicker, expiryStartMonth, YearPicker } from '@/components/shared/date-picker';
import { useDiscardGuard } from '@/components/shared/discard-changes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { track } from '@/lib/analytics';
import { type EquipmentEnum, type Vehicle, type VehicleEnum } from '@/lib/api';
import { useCreateVehicle, useUpdateVehicle } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatExpiry, getExpiryState } from '@/lib/utils/date';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import {
  BRANDS,
  EMISSION_STANDARDS,
  EQUIPMENT_LABEL,
  euroLabel,
  fleetListHref,
  hasEngine,
  hasLoadSpace,
  LOAD_LABEL,
  loadTypesFor,
  TYPE_OF,
  TYPES,
  vehicleHref,
} from '../fleet';
import {
  cleanNumberInput,
  type DateField,
  isDirty,
  isIntegerField,
  type NumberField,
  toFormValues,
  toPayload,
  validate,
  type VehicleFormValues,
} from './values';

/**
 * Novi / Uredi vozilo (DECISIONS §5 „Flota”, lab /fleet „Novi” + „Uredi”, /forms): Vrsta radio cards at the top (new
 * only; edit never changes the type), sections Osnovno · Registracija i osiguranje · Pregledi i održavanje · Motor ·
 * Utovarni prostor (only the ones the type has), marka = suggestions + any name, empty number fields, units inside the
 * field, expiry warnings on the label row. Validation on blur and on save; the save button is always enabled and jumps
 * to the first problem; actions in a sticky bottom bar (DECISIONS §2 page-level forms).
 */
export function VehicleForm({ vehicle, initialType }: { vehicle?: Vehicle; initialType: VehicleEnum }) {
  const router = useRouter();
  const isEdit = !!vehicle;
  // Frozen at mount: a background refetch must not make the form dirty or overwrite what is being typed.
  const [initial] = React.useState(() => toFormValues(vehicle));
  const [type, setType] = React.useState<VehicleEnum>(vehicle?.type ?? initialType);
  const [values, setValues] = React.useState(initial);
  const [touched, setTouched] = React.useState(false);
  const [triedToSave, setTriedToSave] = React.useState(false);
  const { mutateAsync: createVehicle, isPending: creating } = useCreateVehicle();
  const { mutateAsync: updateVehicle, isPending: updating } = useUpdateVehicle(vehicle?.id ?? '');
  const saving = creating || updating;

  const errors = validate(values);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const registrationError = touched || triedToSave ? errors.registration : undefined;
  const dirty = isDirty(values, initial) || type !== (vehicle?.type ?? initialType);

  const set = <K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  // Leaving: back to the vehicle (Uredi) or to the type's tab (Novi).
  const leave = React.useCallback(
    () => void router.push(vehicle ? vehicleHref(vehicle.id) : fleetListHref(initialType)),
    [router, vehicle, initialType]
  );
  const guard = useDiscardGuard({ dirty, onClose: leave });

  async function handleSave() {
    if (errorCount > 0) {
      setTouched(true);
      setTriedToSave(true);
      document.getElementById('v-reg')?.focus();
      return;
    }

    try {
      if (vehicle) {
        await updateVehicle(toPayload(values, type, initial));
        showSuccessToast({ title: 'Vozilo ažurirano', description: values.registration.trim().toUpperCase() });
        void router.push(vehicleHref(vehicle.id));
      } else {
        const created = await createVehicle(toPayload(values, type));
        track('vehicle created', { vehicle_type: type });
        showSuccessToast({ title: 'Vozilo dodano', description: values.registration.trim().toUpperCase() });
        void router.push(created?.id ? vehicleHref(created.id) : fleetListHref(type));
      }
    } catch {
      showErrorToast({ title: 'Vozilo nije spremljeno', description: 'Pokušaj ponovno.' });
    }
  }

  const date = (field: DateField, label: string, { warn = true, placeholder = 'Vrijedi do' } = {}) => (
    <ExpiryField
      id={`v-${field}`}
      label={label}
      placeholder={placeholder}
      value={values[field]}
      warn={warn}
      onChange={(next) => set(field, next)}
    />
  );
  const number = (field: NumberField, label: string, unit?: string) => (
    <NumberInputField
      decimal={!isIntegerField(field)}
      id={`v-${field}`}
      label={label}
      unit={unit}
      value={values[field]}
      onChange={(next) => set(field, next)}
    />
  );
  const dimension = (field: 'length' | 'width' | 'height', label: string) => (
    <NumberInputField
      id={`v-${field}`}
      label={label}
      unit="m"
      value={values[field]}
      onChange={(next) => set(field, next)}
    />
  );

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      {/* Novi only: fixes a wrong pick from „Dodaj vozilo”. Uredi never changes the type. */}
      {!isEdit && (
        <Field>
          <FieldLabel>Vrsta vozila</FieldLabel>
          <RadioGroup
            aria-label="Vrsta vozila"
            className="grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            value={type}
            onValueChange={(next) => setType(next as VehicleEnum)}
          >
            {TYPES.map((option) => {
              const checked = type === option.type;
              return (
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                    checked ? 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/15' : 'hover:bg-muted/50'
                  )}
                  key={option.type}
                >
                  <RadioGroupItem className="mt-0.5" value={option.type} />
                  <span className="flex min-w-0 flex-col">
                    <span className={cn('text-sm', checked && 'font-medium')}>{option.singular}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </Field>
      )}

      <FieldSet>
        <Legend>Osnovno</Legend>
        <FieldGroup className="gap-4">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field data-invalid={registrationError ? true : undefined}>
              <FieldLabel htmlFor="v-reg">Registracija</FieldLabel>
              <Input
                aria-invalid={registrationError ? true : undefined}
                autoFocus={!isEdit}
                className="font-mono uppercase"
                id="v-reg"
                placeholder="KC 123-AB"
                value={values.registration}
                onBlur={() => setTouched(true)}
                onChange={(event) => set('registration', event.target.value)}
              />
              {registrationError && <FieldError>{registrationError}</FieldError>}
            </Field>
            <BrandField type={type} value={values.brand} onChange={(next) => set('brand', next)} />
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="v-vin">Broj šasije (VIN)</FieldLabel>
              <Input
                className="font-mono uppercase"
                id="v-vin"
                maxLength={17}
                value={values.vehicleIdentificationNumber}
                onChange={(event) => set('vehicleIdentificationNumber', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="v-year">Godina proizvodnje</FieldLabel>
              <YearPicker
                id="v-year"
                value={values.manufacturingYear}
                onChange={(next) => set('manufacturingYear', next)}
              />
            </Field>
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {number('numberOfAxles', 'Broj osovina')}
            {number('emptyWeight', type === 'TRAILER' ? 'Masa prazne poluprikolice' : 'Masa praznog vozila', 'kg')}
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <Legend>Registracija i osiguranje</Legend>
        <FieldDescription>
          Datumi se prate: na popisu i na vozilu vidi se što je isteklo ili uskoro istječe.
        </FieldDescription>
        <FieldGroup className="gap-4">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {date('registrationDate', 'Datum registracije', { warn: false, placeholder: 'Odaberi datum' })}
            {date('registrationExpiryDate', 'Registracija vrijedi do')}
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            {date('mandatoryInsuranceExpiryDate', 'Obvezno osiguranje')}
            {date('optionalInsuranceExpiryDate', 'Kasko')}
            {date('leasingExpiryDate', 'Leasing')}
          </div>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <Legend>Pregledi i održavanje</Legend>
        <FieldGroup className="gap-4">
          <div className="grid items-start gap-4 sm:grid-cols-2">
            {date('technicalInspectionExpiryDate', 'Tehnički pregled')}
            {date('periodicalTechnicalInspectionExpiryDate', 'Periodički tehnički pregled')}
          </div>
          {hasEngine(type) && (
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {date('tachographExpiryDate', 'Tahograf')}
              {date('fireExtinguisherCheckExpiryDate', 'Vatrogasni aparat')}
            </div>
          )}
          <div className="grid items-start gap-4 sm:grid-cols-3">
            {date('smallServiceExpiryDate', 'Mali servis')}
            {date('bigServiceExpiryDate', 'Veliki servis')}
            {date('tiresReplacementExpiryDate', 'Gume')}
          </div>
        </FieldGroup>
      </FieldSet>

      {hasEngine(type) && (
        <FieldSet>
          <Legend>Motor</Legend>
          <FieldGroup className="gap-4">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="v-euro">Euro norma</FieldLabel>
                <NativeSelect
                  className="w-full"
                  id="v-euro"
                  value={values.emissionStandard}
                  onChange={(event) => set('emissionStandard', event.target.value)}
                >
                  <NativeSelectOption value="">Odaberi</NativeSelectOption>
                  {EMISSION_STANDARDS.map((level) => (
                    <NativeSelectOption key={level} value={level}>
                      {euroLabel(level)}
                    </NativeSelectOption>
                  ))}
                  {/* A value outside today's list stays selectable instead of silently turning into „Odaberi”. */}
                  {values.emissionStandard && !EMISSION_STANDARDS.includes(values.emissionStandard) && (
                    <NativeSelectOption value={values.emissionStandard}>{values.emissionStandard}</NativeSelectOption>
                  )}
                </NativeSelect>
              </Field>
              {number('enginePower', 'Snaga motora', 'kW')}
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {number('tankSize', 'Spremnik goriva', 'l')}
              {number('averageFuelConsumption', 'Prosječna potrošnja', 'l/100 km')}
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">{date('adrExpiryDate', 'ADR vrijedi do')}</div>
          </FieldGroup>
        </FieldSet>
      )}

      {hasLoadSpace(type) && (
        <FieldSet>
          <Legend>Utovarni prostor</Legend>
          <FieldGroup className="gap-4">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="v-load">Vrsta</FieldLabel>
                <NativeSelect
                  className="w-full"
                  id="v-load"
                  value={values.vehicleLoadType}
                  onChange={(event) => set('vehicleLoadType', event.target.value)}
                >
                  <NativeSelectOption value="">Odaberi</NativeSelectOption>
                  {loadTypesFor(type).map((key) => (
                    <NativeSelectOption key={key} value={key}>
                      {LOAD_LABEL[key]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              {number('loadCapacity', 'Kapacitet', 'kg')}
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-3">
              {dimension('length', 'Duljina')}
              {dimension('width', 'Širina')}
              {dimension('height', 'Visina')}
            </div>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {date('codeXlCertificateExpiryDate', 'Code XL certifikat')}
              <Field>
                <FieldLabel htmlFor="v-ramp">Rampa</FieldLabel>
                <label className="flex h-10 items-center gap-2 text-sm">
                  <Switch checked={values.ramp} id="v-ramp" onCheckedChange={(checked) => set('ramp', checked)} />
                  {values.ramp ? 'Ima rampu' : 'Nema rampu'}
                </label>
              </Field>
            </div>
            <Field>
              <FieldLabel>Oprema</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(EQUIPMENT_LABEL) as EquipmentEnum[]).map((item) => {
                  const checked = values.equipment.includes(item);
                  return (
                    <label
                      className={cn(
                        'flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm',
                        checked && 'border-primary/50 bg-primary/5 dark:bg-primary/15'
                      )}
                      key={item}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          set(
                            'equipment',
                            checked ? values.equipment.filter((other) => other !== item) : [...values.equipment, item]
                          )
                        }
                      />
                      {EQUIPMENT_LABEL[item]}
                    </label>
                  );
                })}
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-popover px-4 py-3 shadow-lg">
        <span className={cn('text-sm', triedToSave && errorCount > 0 ? 'text-destructive' : 'text-muted-foreground')}>
          {triedToSave && errorCount > 0 ? (
            `${errorCount} ${plural(errorCount, ['polje treba', 'polja trebaju', 'polja treba'])} ispraviti`
          ) : (
            <>
              {TYPE_OF[type].singular}
              {values.registration.trim() && (
                <>
                  {' · '}
                  <span className="font-mono text-foreground uppercase">{values.registration.trim()}</span>
                </>
              )}
            </>
          )}
        </span>
        <div className="flex gap-2">
          <Button disabled={saving} variant="ghost" onClick={guard.requestClose}>
            Odustani
          </Button>
          <Button loading={saving} onClick={() => void handleSave()}>
            {isEdit ? 'Spremi promjene' : `Dodaj ${TYPE_OF[type].accusative}`}
          </Button>
        </div>
      </div>
      {guard.discardDialog}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------------------------------------------------

function Legend({ children }: { children: React.ReactNode }) {
  return <FieldLegend className="font-heading font-bold tracking-tight">{children}</FieldLegend>;
}

/** Expiry date; the warning sits on the label row as a small badge, so nothing below moves. */
function ExpiryField({
  id,
  label,
  value,
  onChange,
  warn = true,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder: string;
  /** 'YYYY-MM-DD' or ''. */
  value: string;
  onChange(value: string): void;
  warn?: boolean;
}) {
  const state = warn ? getExpiryState(value || null) : 'missing';
  const hint = state === 'expired' || state === 'soon' ? formatExpiry(value) : null;
  return (
    <Field>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {hint && (
          <Badge className="shrink-0" size="sm" tone={state === 'expired' ? 'danger' : 'warning'}>
            {hint}
          </Badge>
        )}
      </div>
      <DatePicker
        id={id}
        placeholder={placeholder}
        startMonth={warn ? expiryStartMonth() : undefined}
        value={value ? dayjs(value).toDate() : null}
        onChange={(next) => onChange(next ? dayjs(next).format('YYYY-MM-DD') : '')}
      />
    </Field>
  );
}

/** Empty when unknown; the unit sits inside the field, next to the number. */
function NumberInputField({
  id,
  label,
  unit,
  value,
  onChange,
  decimal = true,
}: {
  id: string;
  label: string;
  unit?: string;
  value: string;
  onChange(value: string): void;
  decimal?: boolean;
}) {
  const inputProps = {
    id,
    inputMode: decimal ? ('decimal' as const) : ('numeric' as const),
    autoComplete: 'off',
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange(cleanNumberInput(event.target.value, { decimal })),
  };
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {unit ? (
        <InputGroup>
          <InputGroupInput className="tabular-nums" {...inputProps} />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{unit}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input className="tabular-nums" {...inputProps} />
      )}
    </Field>
  );
}

/** Marka: the type's usual brands as suggestions; a typed name not in the list is offered as its own item. */
function BrandField({ type, value, onChange }: { type: VehicleEnum; value: string; onChange(value: string): void }) {
  const suggestions = BRANDS[type];
  const typed = value.trim();
  const items =
    typed && !suggestions.some((name) => name.toLowerCase() === typed.toLowerCase())
      ? [...suggestions, typed]
      : suggestions;
  return (
    <Field>
      <FieldLabel htmlFor="v-brand">Marka</FieldLabel>
      <Combobox
        autoHighlight
        inputValue={value}
        items={items}
        value={typed || null}
        onInputValueChange={(next) => onChange(next)}
        onValueChange={(next) => onChange((next as string | null) ?? '')}
      >
        <ComboboxInput className="w-full" id="v-brand" placeholder="Npr. Volvo" showClear={!!typed} />
        <ComboboxContent>
          <ComboboxEmpty>Upiši naziv marke.</ComboboxEmpty>
          <ComboboxList>
            {(name: string) => (
              <ComboboxItem key={name} value={name}>
                {name === typed && !suggestions.includes(name) ? <>Dodaj „{name}”</> : name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
