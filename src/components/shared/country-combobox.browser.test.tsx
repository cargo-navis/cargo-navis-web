import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { type Country, getEuropeCountryOptions } from '@/lib/utils/countries';

import { CountryCombobox } from './country-combobox';

/** Država on a form: a label and the picked country in state. */
function CountryField({
  initial = null,
  onValueChange,
  countries,
  disabled,
}: {
  initial?: Country | null;
  onValueChange?(value: Country | null): void;
  countries?: Country[];
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState<Country | null>(initial);
  return (
    <>
      <label htmlFor="country">Država</label>
      <CountryCombobox
        countries={countries}
        disabled={disabled}
        id="country"
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
      />
    </>
  );
}

const option = (name: string) => page.getByRole('option').filter({ hasText: name });

/** The country names listed, in order (the option text minus the code at the end). */
async function listedNames() {
  await expect.element(page.getByRole('listbox')).toBeInTheDocument();
  return page
    .getByRole('option')
    .elements()
    .map((el) => el.textContent?.replace(/[A-Z]{2}$/, ''));
}

describe('CountryCombobox', () => {
  it('lists all countries by their Croatian name, sorted the Croatian way', async () => {
    const screen = await render(<CountryField />);
    const input = screen.getByLabelText('Država');
    await expect.element(input).toHaveAttribute('placeholder', 'Odaberi državu');
    await input.click();

    await expect.element(option('Hrvatska')).toBeInTheDocument();
    const names = await listedNames();
    expect(names.length).toBeGreaterThan(200);
    expect(names).toEqual(expect.arrayContaining(['Hrvatska', 'Njemačka', 'Austrija', 'Češka', 'Slovenija']));
    expect(names).toEqual([...names].sort((a, b) => a!.localeCompare(b!, 'hr')));
    // Croatian order: Č after C, Š after S, Ž last.
    expect(names.indexOf('Češka')).toBeGreaterThan(names.indexOf('Crna Gora'));
    expect(names.indexOf('Švedska')).toBeGreaterThan(names.indexOf('Sudan'));
  });

  it('shows the flag, the name and the code', async () => {
    const screen = await render(<CountryField />);
    await userEvent.type(screen.getByLabelText('Država'), 'Hrvat');

    const hr = option('Hrvatska');
    await expect.element(hr).toBeVisible();
    expect(hr.element().textContent).toBe('HrvatskaHR');
    // flag-icons CSS comes from a CDN (not loaded here): the flag span has no size, so check presence only.
    await expect.element(hr.getByRole('img', { name: 'HR' })).toBeInTheDocument();
  });

  it('filters by name, ignoring case and diacritics', async () => {
    const screen = await render(<CountryField />);
    const input = screen.getByLabelText('Država');

    await userEvent.type(input, 'njem');
    await expect.element(option('Njemačka')).toBeVisible();
    expect(await listedNames()).toEqual(['Njemačka']);

    await userEvent.clear(input);
    await userEvent.type(input, 'CESKA');
    await expect.element(option('Češka')).toBeVisible();
    expect(await listedNames()).toEqual(['Češka']);

    await userEvent.clear(input);
    await userEvent.type(input, 'slov');
    await expect.element(option('Slovenija')).toBeVisible();
    expect(await listedNames()).toEqual(['Slovačka', 'Slovenija']);
  });

  it('shows „Nema te države.” when nothing matches', async () => {
    const screen = await render(<CountryField />);
    await userEvent.type(screen.getByLabelText('Država'), 'xyz');

    await expect.element(page.getByText('Nema te države.')).toBeVisible();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('picking a country calls onValueChange with it and fills the input with its name', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<CountryField onValueChange={onValueChange} />);
    const input = screen.getByLabelText('Država');

    await userEvent.type(input, 'aust');
    await option('Austrija').click();

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ code: 'AT', name: 'Austrija' });
    await expect.element(input).toHaveValue('Austrija');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
  });

  it('Enter picks the first match (autoHighlight)', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<CountryField onValueChange={onValueChange} />);

    await userEvent.type(screen.getByLabelText('Država'), 'sloven');
    await expect.element(option('Slovenija')).toBeVisible();
    await userEvent.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ code: 'SI', name: 'Slovenija' });
  });

  it('a selected country shows its name and marks its option; the clear button empties it', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <CountryField initial={{ code: 'HR', name: 'Hrvatska' }} onValueChange={onValueChange} />
    );
    const input = screen.getByLabelText('Država');
    await expect.element(input).toHaveValue('Hrvatska');

    // Opening with the selection in the input lists everything, the selected one marked.
    await input.click();
    await expect.element(option('Hrvatska')).toHaveAttribute('aria-selected', 'true');
    await expect.element(option('Austrija')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    const clear = screen.container.querySelector<HTMLButtonElement>('[data-slot="combobox-clear"]');
    expect(clear).not.toBeNull();
    await userEvent.click(clear!);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
    await expect.element(input).toHaveValue('');
  });

  it('only the given countries (the European subset)', async () => {
    const screen = await render(<CountryField countries={getEuropeCountryOptions()} />);
    const input = screen.getByLabelText('Država');

    await userEvent.type(input, 'kin');
    await expect.element(page.getByText('Nema te države.')).toBeVisible();

    await userEvent.clear(input);
    await userEvent.type(input, 'hrv');
    await expect.element(option('Hrvatska')).toBeVisible();
  });

  it('disabled: the input cannot be used', async () => {
    const screen = await render(<CountryField disabled initial={{ code: 'HR', name: 'Hrvatska' }} />);
    const input = screen.getByLabelText('Država');

    await expect.element(input).toBeDisabled();
    await expect.element(input).toHaveValue('Hrvatska');
    for (const button of screen.container.querySelectorAll('button')) expect(button).toBeDisabled();
  });

  it('marks the field invalid only when told so', async () => {
    const screen = await render(
      <>
        <label htmlFor="c">Država</label>
        <CountryCombobox id="c" invalid placeholder="Država utovara" value={null} onValueChange={() => undefined} />
      </>
    );
    const input = screen.getByLabelText('Država');
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect.element(input).toHaveAttribute('placeholder', 'Država utovara');
  });
});
