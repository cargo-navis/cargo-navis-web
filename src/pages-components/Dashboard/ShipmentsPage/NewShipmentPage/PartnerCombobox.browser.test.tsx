import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { PartnerCombobox } from './PartnerCombobox';

const PARTNERS = [
  { id: 'p1', name: 'Kraš d.d.', taxId: '12345678901', address: { placeName: 'Zagreb', countryCode: 'HR' } },
  { id: 'p2', name: 'Đuro Đaković', taxId: '98765432109', address: { placeName: 'Slavonski Brod', countryCode: 'HR' } },
  {
    id: 'p3',
    name: 'Spedition Müller GmbH',
    taxId: 'DE811111111',
    address: { placeName: 'München', countryCode: 'DE' },
  },
  { id: 'p4', name: 'Bez adrese j.d.o.o.', taxId: '55555555555', address: null },
  { id: 'p5', name: 'Bez OIB-a', taxId: '', address: { placeName: 'Split', countryCode: 'HR' } },
];

/** Klijent on the Novi nalog form: a label and the picked id in state. */
function KlijentField({ initial = '', onChange }: { initial?: string; onChange?(id: string): void }) {
  const [value, setValue] = React.useState(initial);
  return (
    <>
      <label htmlFor="klijent">Klijent</label>
      <PartnerCombobox
        id="klijent"
        items={PARTNERS}
        placeholder="Odaberi klijenta"
        value={value}
        onChange={(id) => {
          setValue(id);
          onChange?.(id);
        }}
      />
    </>
  );
}

const option = (name: string) => page.getByRole('option').filter({ hasText: name });

/** The names of the listed options, in order. */
async function listedNames() {
  await expect.element(page.getByRole('listbox')).toBeInTheDocument();
  return page
    .getByRole('option')
    .elements()
    .map((el) => el.querySelector('.truncate')?.textContent);
}

describe('PartnerCombobox', () => {
  it('lists every partner when opened', async () => {
    const screen = await render(<KlijentField />);
    await screen.getByLabelText('Klijent').click();

    await expect.element(option('Kraš d.d.')).toBeVisible();
    expect(await listedNames()).toEqual(PARTNERS.map((p) => p.name));
  });

  it('filters by name, ignoring case and diacritics', async () => {
    const screen = await render(<KlijentField />);
    const input = screen.getByLabelText('Klijent');

    await userEvent.type(input, 'KRAS');
    await expect.element(option('Kraš d.d.')).toBeVisible();
    expect(await listedNames()).toEqual(['Kraš d.d.']);

    await userEvent.clear(input);
    await userEvent.type(input, 'duro dak');
    await expect.element(option('Đuro Đaković')).toBeVisible();
    expect(await listedNames()).toEqual(['Đuro Đaković']);

    await userEvent.clear(input);
    await userEvent.type(input, 'muller');
    await expect.element(option('Spedition Müller GmbH')).toBeVisible();
    expect(await listedNames()).toEqual(['Spedition Müller GmbH']);
  });

  it('filters by tax id, also a part of it and its country prefix in lower case', async () => {
    const screen = await render(<KlijentField />);
    const input = screen.getByLabelText('Klijent');

    await userEvent.type(input, '98765');
    await expect.element(option('Đuro Đaković')).toBeVisible();
    expect(await listedNames()).toEqual(['Đuro Đaković']);

    await userEvent.clear(input);
    await userEvent.type(input, 'de8111');
    await expect.element(option('Spedition Müller GmbH')).toBeVisible();
    expect(await listedNames()).toEqual(['Spedition Müller GmbH']);
  });

  it('does not search the place', async () => {
    const screen = await render(<KlijentField />);
    await userEvent.type(screen.getByLabelText('Klijent'), 'Slavonski');
    await expect.element(page.getByText('Nema rezultata.')).toBeVisible();
  });

  it('shows the flag and „place · tax id” under the name', async () => {
    const screen = await render(<KlijentField />);
    await screen.getByLabelText('Klijent').click();

    const kras = option('Kraš d.d.');
    await expect.element(kras).toBeVisible();
    expect(kras.element().textContent).toBe('Kraš d.d.Zagreb · 12345678901');
    // The flag-icons CSS comes from a CDN (not loaded here), so the flag spans have no size: check presence only.
    await expect.element(kras.getByRole('img', { name: 'HR' })).toBeInTheDocument();
    await expect.element(option('Spedition Müller GmbH').getByRole('img', { name: 'DE' })).toBeInTheDocument();

    // Only what is there: no address → just the tax id, no flag; no tax id → just the place.
    const noAddress = option('Bez adrese j.d.o.o.');
    expect(noAddress.element().textContent).toBe('Bez adrese j.d.o.o.55555555555');
    await expect.element(noAddress.getByRole('img')).not.toBeInTheDocument();
    expect(option('Bez OIB-a').element().textContent).toBe('Bez OIB-aSplit');
  });

  it('shows „Nema rezultata.” when nothing matches', async () => {
    const screen = await render(<KlijentField />);
    await userEvent.type(screen.getByLabelText('Klijent'), 'xyz');

    await expect.element(page.getByText('Nema rezultata.')).toBeVisible();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('picking a partner calls onChange with its id and fills the input with the name', async () => {
    const onChange = vi.fn();
    const screen = await render(<KlijentField onChange={onChange} />);
    const input = screen.getByLabelText('Klijent');

    await userEvent.type(input, 'kras');
    await option('Kraš d.d.').click();

    expect(onChange).toHaveBeenCalledExactlyOnceWith('p1');
    await expect.element(input).toHaveValue('Kraš d.d.');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
  });

  it('Enter picks the first match (autoHighlight)', async () => {
    const onChange = vi.fn();
    const screen = await render(<KlijentField onChange={onChange} />);
    const input = screen.getByLabelText('Klijent');

    await userEvent.type(input, 'muller');
    await expect.element(option('Spedition Müller GmbH')).toBeVisible();
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('p3');
    await expect.element(input).toHaveValue('Spedition Müller GmbH');
  });

  it('a selected partner shows its name, and the clear button empties it', async () => {
    const onChange = vi.fn();
    const screen = await render(<KlijentField initial="p2" onChange={onChange} />);
    const input = screen.getByLabelText('Klijent');
    await expect.element(input).toHaveValue('Đuro Đaković');

    const clear = screen.container.querySelector<HTMLButtonElement>('[data-slot="combobox-clear"]');
    expect(clear).not.toBeNull();
    await userEvent.click(clear!);

    expect(onChange).toHaveBeenCalledExactlyOnceWith('');
    await expect.element(input).toHaveValue('');
    expect(screen.container.querySelector('[data-slot="combobox-clear"]')).toBeNull();
  });

  it('no clear button while nothing is selected', async () => {
    const screen = await render(<KlijentField />);
    await expect.element(screen.getByLabelText('Klijent')).toBeVisible();
    expect(screen.container.querySelector('[data-slot="combobox-clear"]')).toBeNull();
  });

  // Regression: the clear button was an icon with no accessible name, announced as just „button” (KAN-153).
  it('the clear button has an accessible name', async () => {
    const screen = await render(<KlijentField initial="p1" />);
    await expect.element(screen.getByRole('button', { name: 'Očisti' })).toBeVisible();
  });

  it('marks the field invalid only when told so', async () => {
    const screen = await render(
      <>
        <label htmlFor="podvozar">Podvozar</label>
        <PartnerCombobox
          id="podvozar"
          invalid
          items={PARTNERS}
          placeholder="Odaberi podvozara"
          value=""
          onChange={() => undefined}
        />
      </>
    );
    const input = screen.getByLabelText('Podvozar');
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect.element(input).toHaveAttribute('placeholder', 'Odaberi podvozara');
  });
});
