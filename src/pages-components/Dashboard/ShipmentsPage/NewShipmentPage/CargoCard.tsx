import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { PalleteType } from '@/lib/utils/palletes';
import { Icon } from '@/ui';

import { ChoiceCards, ErrorText, Label, NumberInput, Section, useNalogForm } from './form-context';
import { StopBlock } from './StopBlock';
import { autoLdm, type CargoValues, emptyCargo, fieldDomId, isLdmAuto } from './values';

/** Lab /nalog-form `PALLETS` labels (today's palleteNameMap, shorter). */
const PALLET_LABEL: Record<PalleteType, string> = {
  [PalleteType.Small]: 'Mala (80×60)',
  [PalleteType.Euro]: 'Euro (120×80)',
  [PalleteType.Ship]: 'Brodska (120×100)',
  [PalleteType.Industry]: 'Industrijska (100×100)',
  [PalleteType.Jumbo]: 'Jumbo (120×120)',
};

const DIMENSIONS = [
  { key: 'length', label: 'Duljina' },
  { key: 'width', label: 'Širina' },
  { key: 'height', label: 'Visina' },
] as const;

/** Tereti (lab /nalog-form `CargoList`): one card per teret, „Dodaj teret” below. */
export function CargoList() {
  const { values, set } = useNalogForm();
  return (
    <Section title="Tereti">
      <div className="flex flex-col gap-4">
        {values.cargo.map((cargo, index) => (
          <CargoCard
            cargo={cargo}
            index={index}
            key={cargo.key}
            total={values.cargo.length}
            onRemove={() => set({ cargo: values.cargo.filter((item) => item.key !== cargo.key) })}
          />
        ))}
        <Button
          className="w-full border-dashed"
          variant="outline"
          onClick={() => set({ cargo: [...values.cargo, emptyCargo()] })}
        >
          <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj teret
        </Button>
      </div>
    </Section>
  );
}

function CargoCard({
  cargo,
  index,
  total,
  onRemove,
}: {
  cargo: CargoValues;
  index: number;
  total: number;
  onRemove(): void;
}) {
  const { setCargo, errorOf, touch } = useNalogForm();
  const key = (field: string) => `${cargo.key}.${field}`;
  const update = (patch: Partial<CargoValues>, field?: string) => setCargo(cargo.key, patch, field && key(field));
  const palletsError = errorOf(key('palleteAmount'));

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-bold tracking-tight">Teret {index + 1}</h3>
        {total > 1 && (
          <Button
            // Several cards each have one: the name says which teret.
            aria-label={`Ukloni teret ${index + 1}`}
            className="text-muted-foreground hover:text-destructive"
            size="sm"
            variant="ghost"
            onClick={onRemove}
          >
            <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Ukloni
          </Button>
        )}
      </div>
      <ChoiceCards
        label="Vrsta tereta"
        options={[
          { key: 'standard', label: 'Palete', description: 'Vrsta i broj paleta' },
          { key: 'nonstandard', label: 'Izvanredni teret', description: 'Dimenzije, kolete' },
        ]}
        size="sm"
        value={cargo.type}
        // Today: switching type starts the count again (pallets vs kolete share the field).
        onChange={(type) => update({ type, palleteAmount: '', hasKolete: false })}
      />

      {cargo.type === 'standard' ? (
        <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Field>
            <Label htmlFor={fieldDomId(key('palleteType'))}>Vrsta palete</Label>
            <NativeSelect
              className="w-full"
              id={fieldDomId(key('palleteType'))}
              value={cargo.palleteType}
              onChange={(event) => update({ palleteType: event.target.value as PalleteType })}
            >
              {Object.values(PalleteType).map((type) => (
                <NativeSelectOption key={type} value={type}>
                  {PALLET_LABEL[type]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field data-invalid={palletsError ? true : undefined}>
            <Label field={key('palleteAmount')} htmlFor={fieldDomId(key('palleteAmount'))}>
              Broj paleta
            </Label>
            <NumberInput
              decimal={false}
              field={key('palleteAmount')}
              invalid={!!palletsError}
              value={cargo.palleteAmount}
              onBlur={() => touch(key('palleteAmount'))}
              onChange={(palleteAmount) => update({ palleteAmount }, 'palleteAmount')}
            />
            <ErrorText>{palletsError}</ErrorText>
          </Field>
          <LdmField cargo={cargo} />
          <WeightField cargo={cargo} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid items-start gap-3 sm:grid-cols-5">
            {DIMENSIONS.map((dimension) => {
              const error = errorOf(key(dimension.key));
              return (
                <Field data-invalid={error ? true : undefined} key={dimension.key}>
                  <Label field={key(dimension.key)} htmlFor={fieldDomId(key(dimension.key))}>
                    {dimension.label}
                  </Label>
                  <NumberInput
                    field={key(dimension.key)}
                    invalid={!!error}
                    unit="m"
                    value={cargo[dimension.key]}
                    onBlur={() => touch(key(dimension.key))}
                    onChange={(value) => update({ [dimension.key]: value }, dimension.key)}
                  />
                  <ErrorText>{error}</ErrorText>
                </Field>
              );
            })}
            <LdmField cargo={cargo} />
            <WeightField cargo={cargo} />
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <label className="flex h-10 items-center gap-2 text-sm">
              <Checkbox
                checked={cargo.hasKolete}
                onCheckedChange={(checked) =>
                  update({ hasKolete: !!checked, palleteAmount: checked ? cargo.palleteAmount || '1' : '' })
                }
              />
              Kolete
            </label>
            {cargo.hasKolete && (
              <Field className="w-32" data-invalid={palletsError ? true : undefined}>
                {/* The checkbox above says what this is; screen readers need the field's own name. */}
                <label className="sr-only" htmlFor={fieldDomId(key('palleteAmount'))}>
                  Broj koleta
                </label>
                <NumberInput
                  decimal={false}
                  field={key('palleteAmount')}
                  invalid={!!palletsError}
                  unit="kom"
                  value={cargo.palleteAmount}
                  onBlur={() => touch(key('palleteAmount'))}
                  onChange={(palleteAmount) => update({ palleteAmount }, 'palleteAmount')}
                />
                <ErrorText>{palletsError}</ErrorText>
              </Field>
            )}
          </div>
        </div>
      )}

      <Field>
        <Label field={key('description')} htmlFor={fieldDomId(key('description'))}>
          Opis tereta
        </Label>
        <Input
          id={fieldDomId(key('description'))}
          placeholder="Npr. prehrambeni proizvodi, ne slagati"
          value={cargo.description}
          onChange={(event) => update({ description: event.target.value }, 'description')}
        />
      </Field>

      <div className="grid items-start gap-3 lg:grid-cols-2">
        <StopBlock cargo={cargo} kind="loading" />
        <StopBlock cargo={cargo} kind="unloading" />
      </div>
    </section>
  );
}

/** LDM: computed from pallets / dimensions („izračunato”) until the user types their own. */
function LdmField({ cargo }: { cargo: CargoValues }) {
  const { setCargo, errorOf, touch } = useNalogForm();
  const field = `${cargo.key}.ldm`;
  const error = errorOf(field);
  const isAuto = !!cargo.ldm && isLdmAuto(cargo) && autoLdm(cargo) !== undefined;
  return (
    <Field data-invalid={error ? true : undefined}>
      <Label field={field} hint={isAuto ? 'izračunato' : undefined} htmlFor={fieldDomId(field)}>
        LDM
      </Label>
      <NumberInput
        field={field}
        invalid={!!error}
        unit="m"
        value={cargo.ldm}
        onBlur={() => touch(field)}
        onChange={(ldm) => setCargo(cargo.key, { ldm }, field)}
      />
      <ErrorText>{error}</ErrorText>
    </Field>
  );
}

function WeightField({ cargo }: { cargo: CargoValues }) {
  const { setCargo, errorOf, touch } = useNalogForm();
  const field = `${cargo.key}.weight`;
  const error = errorOf(field);
  return (
    <Field data-invalid={error ? true : undefined}>
      <Label field={field} htmlFor={fieldDomId(field)}>
        Težina
      </Label>
      <NumberInput
        field={field}
        invalid={!!error}
        unit="kg"
        value={cargo.weight}
        onBlur={() => touch(field)}
        onChange={(weight) => setCargo(cargo.key, { weight }, field)}
      />
      <ErrorText>{error}</ErrorText>
    </Field>
  );
}
