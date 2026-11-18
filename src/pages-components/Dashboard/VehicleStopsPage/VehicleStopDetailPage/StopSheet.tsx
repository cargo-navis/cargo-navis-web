import dayjs from 'dayjs';
import * as React from 'react';

import { AsyncCombobox } from '@/components/shared/async-combobox';
import { DatePicker } from '@/components/shared/date-picker';
import { useDiscardGuard } from '@/components/shared/discard-changes';
import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { searchPostalCodes } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import {
  useClients,
  useCreateVehicleStops,
  useDispatchers,
  useDrivers,
  useTrailers,
  useUpdateVehicleStop,
} from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { EUROPE_COUNTRY_CODES } from '@/lib/utils/countries.const';
import { pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { kindWord, placeOnly, toApiDate } from '../stops';
import { CargoPicker } from './CargoPicker';
import {
  editStopValues,
  type FormCargo,
  type FormPostalCode,
  newStopValues,
  postalCodeLabel,
  type StopFormField,
  type StopFormValues,
  toPayload,
  validateStop,
} from './formValues';
import { type AddressOption, useAddressOptions } from './useAddressOptions';

/** What the sheet edits: an existing stop, or a new one after `previousStopId` (null = first on the route). */
export type StopSheetTarget =
  | { mode: 'edit'; stop: VehicleStop }
  | { mode: 'new'; previousStopId: string | null; previousStop?: VehicleStop };

const FIELD_IDS: Record<StopFormField, string> = {
  address: 'stop-address',
  streetName: 'stop-street',
  postalCode: 'stop-postal-code',
};

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * Uredi / Dodaj utovar / istovar in a side sheet md (DECISIONS §5 Prijevozi, lab /transports `StopSheet`, /overlays/sheet):
 * today's stop form (VehicleStopForm) in the new look. Outside click / Esc / Odustani ask „Odbaciti promjene?” when
 * something was changed.
 */
export function StopSheet({
  vehicleId,
  target,
  onClose,
}: {
  vehicleId: string;
  target: StopSheetTarget | null;
  onClose(): void;
}) {
  const [dirty, setDirty] = React.useState(false);
  // Keep the last one while the sheet slides out.
  const [shown, setShown] = React.useState(target);
  if (target && target !== shown) setShown(target);
  const close = React.useCallback(() => {
    setDirty(false);
    onClose();
  }, [onClose]);
  const guard = useDiscardGuard({ dirty, onClose: close });
  const key = shown ? (shown.mode === 'edit' ? shown.stop.id : `new:${shown.previousStopId ?? 'first'}`) : 'none';

  return (
    <>
      <Sheet open={!!target} onOpenChange={(open) => !open && guard.requestClose()}>
        <SheetContent side="right" size="md">
          {shown && (
            <StopSheetBody
              key={key}
              target={shown}
              vehicleId={vehicleId}
              onCancel={guard.requestClose}
              onDirtyChange={setDirty}
              onSaved={close}
            />
          )}
        </SheetContent>
      </Sheet>
      {guard.discardDialog}
    </>
  );
}

function StopSheetBody({
  vehicleId,
  target,
  onDirtyChange,
  onCancel,
  onSaved,
}: {
  vehicleId: string;
  target: StopSheetTarget;
  onDirtyChange(dirty: boolean): void;
  onCancel(): void;
  onSaved(): void;
}) {
  const stop = target.mode === 'edit' ? target.stop : undefined;
  const [initial] = React.useState(() =>
    target.mode === 'edit' ? editStopValues(target.stop) : newStopValues(target.previousStop)
  );
  const [values, setValues] = React.useState<StopFormValues>(initial);
  // Tereti shown on the form (ticked or not): what the stop had + what was picked since.
  const [shown, setShown] = React.useState(() => ({ loading: initial.loading, unloading: initial.unloading }));
  const [picker, setPicker] = React.useState<StopKind | null>(null);
  const [touched, setTouched] = React.useState<Set<StopFormField>>(() => new Set());
  const [submitted, setSubmitted] = React.useState(false);

  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();
  const { trailers = [] } = useTrailers();
  const { data: clients } = useClients();
  const { options, resolve } = useAddressOptions(stop);
  const { mutateAsync: createStops, isPending: isCreating } = useCreateVehicleStops();
  const { mutateAsync: updateStop, isPending: isUpdating } = useUpdateVehicleStop();

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  React.useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const clientName = React.useMemo(() => {
    const names = new Map<string, string>();
    clients?.forEach((client) => names.set(client.id.toString(), client.name));
    return (id: string | null | undefined) => (id ? names.get(id) : undefined);
  }, [clients]);

  const errors = validateStop(values);
  const errorCount = Object.keys(errors).length;
  const showError = (field: StopFormField) => (submitted || touched.has(field) ? errors[field] : undefined);
  const blur = (field: StopFormField) => setTouched((current) => new Set(current).add(field));
  const set = (patch: Partial<StopFormValues>) => setValues((current) => ({ ...current, ...patch }));

  function setCargo(kind: StopKind, cargos: FormCargo[]) {
    const field = kind === 'loading' ? 'loading' : 'unloading';
    set({ [field]: cargos });
    setShown((current) => {
      const known = new Map(current[field].map((cargo) => [cargo.id, cargo]));
      cargos.forEach((cargo) => known.set(cargo.id, cargo));
      return { ...current, [field]: Array.from(known.values()) };
    });
  }

  function clearAddress() {
    set({ addressKey: null, streetName: '', countryCode: '', postalCode: null, loading: [], unloading: [] });
  }

  function pickAddress(option: AddressOption | null) {
    if (!option) return clearAddress();
    const picked = resolve(option.value);
    if (!picked) return set({ addressKey: option.value });
    set({
      addressKey: option.value,
      streetName: picked.streetName,
      countryCode: picked.countryCode,
      postalCode: picked.postalCode,
    });
    setCargo('loading', picked.loading);
    setCargo('unloading', picked.unloading);
  }

  function toggleAddressMode() {
    set({ addressMode: values.addressMode === 'search' ? 'custom' : 'search' });
    clearAddress();
    setTouched(new Set());
  }

  async function submit() {
    setSubmitted(true);
    if (errorCount > 0) {
      const first = (['address', 'streetName', 'postalCode'] as StopFormField[]).find((field) => errors[field]);
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    try {
      if (stop) {
        await updateStop({ id: stop.id, data: toPayload(values) });
        showSuccessToast({ title: 'Spremljeno' });
      } else if (target.mode === 'new') {
        await createStops([{ vehicleId, previousStopId: target.previousStopId, ...toPayload(values) }]);
        showSuccessToast({ title: addedTitle(values) });
      }
      onSaved();
    } catch {
      showErrorToast({ title: 'Spremanje nije uspjelo. Pokušajte ponovno.' });
    }
  }

  if (picker) {
    return (
      <CargoPicker
        kind={picker}
        selected={picker === 'loading' ? values.loading : values.unloading}
        vehicleStopId={stop?.id}
        onCancel={() => setPicker(null)}
        onConfirm={(cargos) => {
          setCargo(picker, cargos);
          setPicker(null);
        }}
      />
    );
  }

  const selectedOption = options.find((option) => option.value === values.addressKey) ?? null;

  return (
    <>
      <SheetHeader>
        <SheetTitle>{stop ? `Uredi: ${kindWord(stop)} ${placeOnly(stop)}` : 'Novi utovar / istovar'}</SheetTitle>
        <SheetDescription>Ruta ostaje vidljiva lijevo.</SheetDescription>
      </SheetHeader>
      <form
        className="flex min-h-0 flex-1 flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {values.addressMode === 'search' ? (
            <Field data-invalid={!!showError('address') || undefined}>
              <FieldLabel htmlFor={FIELD_IDS.address}>Adresa</FieldLabel>
              <Combobox
                autoHighlight
                filter={(option: AddressOption, query: string) =>
                  fold(`${option.label} ${option.helper ?? ''}`).includes(fold(query.trim()))
                }
                isItemEqualToValue={(a: AddressOption, b: AddressOption) => a.value === b.value}
                itemToStringLabel={(option: AddressOption) => option.label}
                items={options}
                value={selectedOption}
                onValueChange={(option) => pickAddress(option as AddressOption | null)}
              >
                <ComboboxInput
                  aria-invalid={!!showError('address') || undefined}
                  className="w-full"
                  id={FIELD_IDS.address}
                  placeholder="Adresa, klijent ili broj naloga…"
                  showClear={!!selectedOption}
                  onBlur={() => blur('address')}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Nema te adrese na aktivnim nalozima.</ComboboxEmpty>
                  <ComboboxList>
                    {(option: AddressOption) => (
                      <ComboboxItem key={option.value} value={option}>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{option.label}</span>
                          {option.helper && (
                            <span className="truncate text-xs text-muted-foreground">{option.helper}</span>
                          )}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {showError('address') && <FieldError>{showError('address')}</FieldError>}
            </Field>
          ) : (
            <>
              <Field data-invalid={!!showError('streetName') || undefined}>
                <FieldLabel htmlFor={FIELD_IDS.streetName}>Ulica i broj</FieldLabel>
                <Input
                  aria-invalid={!!showError('streetName') || undefined}
                  id={FIELD_IDS.streetName}
                  value={values.streetName}
                  onBlur={() => blur('streetName')}
                  onChange={(event) => set({ streetName: event.target.value })}
                />
                {showError('streetName') && <FieldError>{showError('streetName')}</FieldError>}
              </Field>
              <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
                <Field>
                  <FieldLabel htmlFor="stop-country">Država</FieldLabel>
                  <NativeSelect
                    className="w-full"
                    id="stop-country"
                    value={values.countryCode}
                    onChange={(event) => set({ countryCode: event.target.value, postalCode: null })}
                  >
                    <NativeSelectOption value="">—</NativeSelectOption>
                    {[...EUROPE_COUNTRY_CODES].sort().map((code) => (
                      <NativeSelectOption key={code} value={code}>
                        {code}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Field data-invalid={!!showError('postalCode') || undefined}>
                  <FieldLabel htmlFor={FIELD_IDS.postalCode}>Poštanski broj i mjesto</FieldLabel>
                  <AsyncCombobox<FormPostalCode>
                    disabled={!values.countryCode}
                    getKey={(postalCode) => postalCode.id}
                    getLabel={postalCodeLabel}
                    id={FIELD_IDS.postalCode}
                    invalid={!!showError('postalCode')}
                    minChars={1}
                    placeholder={values.countryCode ? 'Traži poštanski broj…' : 'Prvo odaberi državu'}
                    search={(query) => searchPostalCodes(query, values.countryCode)}
                    value={values.postalCode}
                    onBlur={() => blur('postalCode')}
                    onValueChange={(postalCode) => set({ postalCode })}
                  />
                  {showError('postalCode') && <FieldError>{showError('postalCode')}</FieldError>}
                </Field>
              </div>
            </>
          )}
          <Button className="-mt-2 w-fit" size="xs" type="button" variant="link" onClick={toggleAddressMode}>
            {values.addressMode === 'search' ? 'Prilagođena adresa' : 'Pretraži adrese naloga'}
          </Button>
          <Field>
            <FieldLabel htmlFor="stop-date">Datum</FieldLabel>
            <DatePicker
              id="stop-date"
              value={values.date ? dayjs(values.date).toDate() : null}
              onChange={(date) => set({ date: date ? toApiDate(date) : null })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="stop-driver">Vozač</FieldLabel>
              <NativeSelect
                className="w-full"
                id="stop-driver"
                value={values.driverId}
                onChange={(event) => set({ driverId: event.target.value })}
              >
                <NativeSelectOption value="">Bez vozača</NativeSelectOption>
                {drivers.map((driver) => (
                  <NativeSelectOption key={driver.id} value={driver.id}>
                    {driver.fullName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="stop-trailer">Prikolica</FieldLabel>
              <NativeSelect
                className="w-full"
                id="stop-trailer"
                value={values.trailerId}
                onChange={(event) => set({ trailerId: event.target.value })}
              >
                <NativeSelectOption value="">—</NativeSelectOption>
                {trailers.map((trailer) => (
                  <NativeSelectOption key={trailer.id} value={trailer.id}>
                    {trailer.registration}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="stop-disponent">Disponent</FieldLabel>
            <NativeSelect
              className="w-full"
              id="stop-disponent"
              value={values.disponentId}
              onChange={(event) => set({ disponentId: event.target.value })}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {dispatchers.map((dispatcher) => (
                <NativeSelectOption key={dispatcher.id} value={dispatcher.id}>
                  {dispatcher.fullName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel>Tereti</FieldLabel>
            <div className="flex flex-col gap-3 rounded-lg border p-3 text-sm">
              {(['loading', 'unloading'] as const).map((kind) => {
                const selected = kind === 'loading' ? values.loading : values.unloading;
                const list = shown[kind];
                return (
                  <div className="flex flex-col gap-1.5" key={kind}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('text-xs font-medium tracking-wide uppercase', STOP_KIND[kind].text)}>
                        {STOP_KIND[kind].label}
                        {selected.length > 0 && ` (${selected.length})`}
                      </span>
                      <Button size="sm" type="button" variant="ghost" onClick={() => setPicker(kind)}>
                        <Icon data-icon="inline-start" icon="IconPlus" size="s" />
                        Dodaj teret s naloga
                      </Button>
                    </div>
                    {list.length === 0 ? (
                      <span className="text-muted-foreground">Nijedan teret.</span>
                    ) : (
                      list.map((cargo) => {
                        const checked = selected.some((item) => item.id === cargo.id);
                        return (
                          <label className="flex items-start gap-2" key={cargo.id}>
                            <Checkbox
                              checked={checked}
                              className="mt-0.5"
                              onCheckedChange={(on) =>
                                set({
                                  [kind]: on ? [...selected, cargo] : selected.filter((item) => item.id !== cargo.id),
                                })
                              }
                            />
                            <span className={cn('flex flex-wrap gap-x-1.5', !checked && 'text-muted-foreground')}>
                              {cargo.shipment && <span className="tabular-nums">#{cargo.shipment.orderNumber}</span>}
                              <span className="text-muted-foreground">
                                {[clientName(cargo.shipment?.clientId), cargo.label].filter(Boolean).join(' · ')}
                              </span>
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </Field>
        </div>
        <SheetFooter className="sm:items-center">
          {submitted && errorCount > 0 && (
            <span className="text-sm text-destructive sm:mr-auto">
              {pluralCount(errorCount, ['polje treba ispraviti', 'polja trebaju ispraviti', 'polja treba ispraviti'])}
            </span>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>
            Odustani
          </Button>
          <Button loading={isCreating || isUpdating} type="submit">
            Spremi
          </Button>
        </SheetFooter>
      </form>
    </>
  );
}

function addedTitle(values: StopFormValues) {
  const loading = values.loading.length > 0;
  const unloading = values.unloading.length > 0;
  if (loading && unloading) return 'Utovar i istovar dodani';
  if (loading) return 'Utovar dodan';
  if (unloading) return 'Istovar dodan';
  return 'Dodano na rutu';
}
