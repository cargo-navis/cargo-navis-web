import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

import { CargoList } from './CargoCard';
import { type NalogFormApi, NalogFormProvider } from './form-context';
import { getShipmentSchema } from './schema';
import {
  type CargoValues,
  emptyCargo,
  fieldDomId,
  fieldKeyOf,
  type NalogValues,
  patchCargo,
  toShipmentFields,
} from './values';

const TENANT = 'tenant-1';

/**
 * The Nalog form's state for its Tereti section, wired like NalogForm (same schema, same LDM patching, problems shown
 * once a field is left or after a save attempt), without the page's queries, router and mutations.
 */
function CargoForm({ cargo = [emptyCargo()] }: { cargo?: CargoValues[] }) {
  const [values, setValues] = React.useState<NalogValues>(() => ({
    externalOrderReference: '',
    clientId: 'client-1',
    transportContractorId: TENANT,
    price: '100',
    isAgency: false,
    agencyPrice: '',
    internalNote: '',
    externalNote: '',
    notificationEmails: [],
    cargo,
  }));
  const [touched, setTouched] = React.useState<Set<string>>(() => new Set());
  const [triedToSave, setTriedToSave] = React.useState(false);
  const schema = React.useMemo(() => getShipmentSchema(TENANT), []);

  const errors = React.useMemo(() => {
    try {
      schema.validateSync(toShipmentFields(values), { abortEarly: false });
      return {};
    } catch (error) {
      if (!(error instanceof Yup.ValidationError)) throw error;
      const found: Record<string, string> = {};
      for (const item of error.inner) {
        const key = fieldKeyOf(item.path, values.cargo);
        if (key && !found[key]) found[key] = item.message;
      }
      return found;
    }
  }, [schema, values]);

  const api: NalogFormApi = {
    values,
    tenantId: TENANT,
    clients: [],
    contractors: [],
    set: (patch) => setValues((current) => ({ ...current, ...patch })),
    setCargo: (key, patch) =>
      setValues((current) => ({
        ...current,
        cargo: current.cargo.map((item) => (item.key === key ? patchCargo(item, patch) : item)),
      })),
    errorOf: (field) => (touched.has(field) || triedToSave ? errors[field] : undefined),
    touch: (field) => setTouched((current) => new Set(current).add(field)),
    ai: new Set(),
    aiSource: 'dokumenta',
  };

  return (
    <TooltipProvider>
      <NalogFormProvider value={api}>
        <CargoList />
        <Button onClick={() => setTriedToSave(true)}>Kreiraj nalog</Button>
      </NalogFormProvider>
    </TooltipProvider>
  );
}

const pallets = () => page.getByLabelText('Broj paleta');
const palletType = () => page.getByLabelText('Vrsta palete');
const ldm = () => page.getByLabelText('LDM');
const weight = () => page.getByLabelText('Težina');
const computed = () => page.getByText('izračunato', { exact: true });
/** A cargo type card; its name is the label + the one-line description („Palete Vrsta i broj paleta”). */
const radio = (label: string) =>
  page.getByRole('radiogroup', { name: 'Vrsta tereta' }).getByRole('radio', { name: label, exact: false });

/** Types into a field and leaves it (validation shows on blur). */
async function enter(field: ReturnType<typeof page.getByLabelText>, value: string) {
  await userEvent.fill(field, value);
  await userEvent.tab();
}

describe('CargoCard', () => {
  it('a new teret: Palete, Euro, number fields empty, no problems shown yet', async () => {
    await render(<CargoForm />);

    await expect.element(page.getByRole('heading', { name: 'Teret 1' })).toBeVisible();
    await expect.element(radio('Palete')).toBeChecked();
    await expect.element(radio('Izvanredni teret')).not.toBeChecked();
    await expect.element(palletType()).toHaveDisplayValue('Euro (120×80)');
    await expect.element(pallets()).toHaveValue('');
    await expect.element(ldm()).toHaveValue('');
    await expect.element(weight()).toHaveValue('');
    await expect.element(computed()).not.toBeInTheDocument();
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    // One teret can't be removed.
    await expect.element(page.getByRole('button', { name: 'Ukloni teret 1' })).not.toBeInTheDocument();
  });

  describe('LDM', () => {
    it('is computed from the pallets and follows the count and the pallet type', async () => {
      await render(<CargoForm />);

      await userEvent.fill(pallets(), '3');
      await expect.element(ldm()).toHaveValue('1,2'); // 3 × Euro 0,4
      await expect.element(computed()).toBeVisible();

      await userEvent.fill(pallets(), '10');
      await expect.element(ldm()).toHaveValue('4');

      await userEvent.selectOptions(palletType(), 'Jumbo (120×120)');
      await expect.element(ldm()).toHaveValue('6'); // 10 × 0,6
      await userEvent.selectOptions(palletType(), 'Mala (80×60)');
      await expect.element(ldm()).toHaveValue('2'); // 10 × 0,2
      await userEvent.selectOptions(palletType(), 'Brodska (120×100)');
      await expect.element(ldm()).toHaveValue('5'); // 10 × 0,5

      await userEvent.clear(pallets());
      await expect.element(ldm()).toHaveValue('');
      await expect.element(computed()).not.toBeInTheDocument();
    });

    it('a typed LDM is kept when the pallets change; cleared, it follows again', async () => {
      await render(<CargoForm />);
      await userEvent.fill(pallets(), '3');
      await expect.element(ldm()).toHaveValue('1,2');

      await userEvent.fill(ldm(), '13.6');
      await expect.element(ldm()).toHaveValue('13,6');
      await expect.element(computed()).not.toBeInTheDocument();

      await userEvent.fill(pallets(), '5');
      await expect.element(ldm()).toHaveValue('13,6');

      await userEvent.clear(ldm());
      await userEvent.fill(pallets(), '6');
      await expect.element(ldm()).toHaveValue('2,4');
      await expect.element(computed()).toBeVisible();
    });

    it('oversize cargo: length × width / 2,4', async () => {
      await render(<CargoForm />);
      await radio('Izvanredni teret').click();

      await userEvent.fill(page.getByLabelText('Duljina'), '2.4');
      await expect.element(ldm()).toHaveValue('');
      await userEvent.fill(page.getByLabelText('Širina'), '2');
      await expect.element(ldm()).toHaveValue('2');
      await expect.element(computed()).toBeVisible();
      // Height doesn't count.
      await userEvent.fill(page.getByLabelText('Visina'), '3');
      await expect.element(ldm()).toHaveValue('2');
    });
  });

  it('number fields keep digits only (pallets whole, the rest with a decimal comma)', async () => {
    await render(<CargoForm />);
    await userEvent.fill(pallets(), '1a2.5');
    await expect.element(pallets()).toHaveValue('125');
    await userEvent.fill(weight(), '12.5kg');
    await expect.element(weight()).toHaveValue('12,5');
  });

  describe('cargo type', () => {
    it('Izvanredni teret swaps the pallet fields for dimensions and starts the count again', async () => {
      await render(<CargoForm />);
      await userEvent.fill(pallets(), '3');
      await userEvent.fill(weight(), '800');

      await radio('Izvanredni teret').click();
      await expect.element(radio('Izvanredni teret')).toBeChecked();
      await expect.element(pallets()).not.toBeInTheDocument();
      await expect.element(palletType()).not.toBeInTheDocument();
      for (const label of ['Duljina', 'Širina', 'Visina']) {
        await expect.element(page.getByLabelText(label)).toHaveValue('');
      }
      await expect.element(page.getByRole('checkbox', { name: 'Kolete' })).not.toBeChecked();
      // The computed LDM went with the pallets; the weight stays.
      await expect.element(ldm()).toHaveValue('');
      await expect.element(weight()).toHaveValue('800');

      await radio('Palete').click();
      await expect.element(pallets()).toHaveValue('');
      await expect.element(page.getByLabelText('Duljina')).not.toBeInTheDocument();
    });

    it('Kolete: ticking shows the count (1), unticking hides it', async () => {
      const cargo = emptyCargo();
      await render(<CargoForm cargo={[cargo]} />);
      await radio('Izvanredni teret').click();

      const kolete = page.getByRole('checkbox', { name: 'Kolete' });
      const count = () => page.elementLocator(document.getElementById(fieldDomId(`${cargo.key}.palleteAmount`))!);
      await kolete.click();
      await expect.element(kolete).toBeChecked();
      await expect.element(count()).toHaveValue('1');
      await expect.element(page.getByText('kom', { exact: true })).toBeVisible();

      await userEvent.fill(count(), '0');
      await userEvent.tab();
      await expect.element(page.getByText('Najmanje 1 komad.')).toBeVisible();

      await kolete.click();
      await expect.element(kolete).not.toBeChecked();
      expect(document.getElementById(fieldDomId(`${cargo.key}.palleteAmount`))).toBeNull();
      await expect.element(page.getByText('Najmanje 1 komad.')).not.toBeInTheDocument();
    });

    // Regression: the kolete count field had no label (only the „kom” unit), an unnamed field to a screen reader (KAN-153).
    it('Kolete: the count field has a name', async () => {
      await render(<CargoForm />);
      await radio('Izvanredni teret').click();
      await page.getByRole('checkbox', { name: 'Kolete' }).click();
      await expect.element(page.getByRole('textbox', { name: 'Broj koleta' })).toHaveValue('1');
    });
  });

  describe('validation', () => {
    it('a left field shows its problem; fixing it clears it', async () => {
      await render(<CargoForm />);

      await pallets().click();
      await userEvent.tab();
      await expect.element(page.getByText('Upiši broj paleta.')).toBeVisible();
      await expect.element(pallets()).toHaveAttribute('aria-invalid', 'true');
      // Only the left field complains.
      await expect.element(page.getByText('Upiši težinu.')).not.toBeInTheDocument();

      await enter(weight(), '');
      await expect.element(page.getByText('Upiši težinu.')).toBeVisible();
      await expect.element(weight()).toHaveAttribute('aria-invalid', 'true');

      await enter(pallets(), '0');
      await expect.element(page.getByText('Najmanje 1 paleta.')).toBeVisible();
      await enter(weight(), '0');
      await expect.element(page.getByText('Težina mora biti veća od 0.')).toBeVisible();

      await enter(pallets(), '4');
      await enter(weight(), '1200');
      await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
      await expect.element(pallets()).not.toHaveAttribute('aria-invalid');
      await expect.element(weight()).not.toHaveAttribute('aria-invalid');
    });

    it('LDM and dimensions must be above 0', async () => {
      await render(<CargoForm />);
      await enter(ldm(), '0');
      await expect.element(page.getByText('LDM mora biti veći od 0.')).toBeVisible();

      await radio('Izvanredni teret').click();
      await enter(page.getByLabelText('Duljina'), '0');
      await expect.element(page.getByText('Mora biti veće od 0.')).toBeVisible();
      await expect.element(page.getByLabelText('Duljina')).toHaveAttribute('aria-invalid', 'true');
    });

    it('oversize cargo needs no count', async () => {
      await render(<CargoForm />);
      await radio('Izvanredni teret').click();
      await enter(weight(), '500');
      await page.getByRole('button', { name: 'Kreiraj nalog' }).click();
      await expect.element(page.getByText('Upiši broj koleta.')).not.toBeInTheDocument();
      await expect.element(page.getByText('Upiši broj paleta.')).not.toBeInTheDocument();
    });

    it('after a save attempt every problem shows, utovar / istovar too', async () => {
      await render(<CargoForm />);
      await page.getByRole('button', { name: 'Kreiraj nalog' }).click();

      await expect.element(page.getByText('Upiši broj paleta.')).toBeVisible();
      await expect.element(page.getByText('Upiši težinu.')).toBeVisible();
      await expect.element(page.getByText('Dodaj utovar.')).toBeVisible();
      await expect.element(page.getByText('Dodaj istovar.')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Dodaj utovar' })).toHaveAttribute('aria-invalid', 'true');
    });

    // A11Y, left for the accessibility pass (phase 6): the problem text isn't tied to its field (no aria-describedby),
    // so a screen reader on the invalid field doesn't hear why. form-context.tsx:107-118 / CargoCard.tsx:114-122.
    it.skip('the problem is the invalid field’s description', async () => {
      await render(<CargoForm />);
      await enter(weight(), '');
      await expect.element(weight()).toHaveAccessibleDescription('Upiši težinu.');
    });
  });

  describe('Tereti', () => {
    it('„Dodaj teret” adds a card; each can then be removed', async () => {
      await render(<CargoForm />);
      await page.getByRole('button', { name: 'Dodaj teret' }).click();

      await expect.element(page.getByRole('heading', { name: 'Teret 2' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Ukloni teret 2' })).toBeVisible();
      expect(page.getByLabelText('Težina').elements()).toHaveLength(2);

      // The second card has its own LDM.
      await userEvent.fill(page.getByLabelText('Broj paleta').nth(1), '2');
      await expect.element(page.getByLabelText('LDM').nth(1)).toHaveValue('0,8');
      await expect.element(page.getByLabelText('LDM').first()).toHaveValue('');

      await page.getByRole('button', { name: 'Ukloni teret 1' }).click();
      await expect.element(page.getByRole('heading', { name: 'Teret 2' })).not.toBeInTheDocument();
      // Teret 2 is now Teret 1, with its values.
      await expect.element(ldm()).toHaveValue('0,8');
      await expect.element(page.getByRole('button', { name: 'Ukloni teret 1' })).not.toBeInTheDocument();
    });

    // Regression: with several tereta every remove button was just „Ukloni” (KAN-153).
    it('each remove button names its teret', async () => {
      await render(<CargoForm />);
      await page.getByRole('button', { name: 'Dodaj teret' }).click();
      await expect.element(page.getByRole('button', { name: 'Ukloni teret 2' })).toBeVisible();
    });
  });
});
