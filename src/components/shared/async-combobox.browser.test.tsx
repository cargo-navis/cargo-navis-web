import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { AsyncCombobox } from './async-combobox';

interface City {
  id: string;
  name: string;
  postalCode: string;
}

const ZAGREB: City = { id: '1', name: 'Zagreb', postalCode: '10000' };
const ZADAR: City = { id: '2', name: 'Zadar', postalCode: '23000' };

/** A promise the test settles by hand, to look at the field while a search is still running. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** The field with a label and its own state, like a form field on the page. */
function CityField({
  search,
  onValueChange,
  initial = null,
  disabled,
  minChars,
}: {
  search(query: string): Promise<City[]>;
  onValueChange?(value: City | null): void;
  initial?: City | null;
  disabled?: boolean;
  minChars?: number;
}) {
  const [value, setValue] = React.useState<City | null>(initial);
  return (
    <>
      <label htmlFor="city">Mjesto</label>
      <AsyncCombobox
        disabled={disabled}
        getKey={(city) => city.id}
        getLabel={(city) => city.name}
        id="city"
        minChars={minChars}
        renderItem={(city) => `${city.postalCode} ${city.name}`}
        search={search}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange?.(next);
        }}
      />
    </>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('AsyncCombobox', () => {
  it('asks for more letters and does not search before minChars', async () => {
    const search = vi.fn(async () => [ZAGREB]);
    const screen = await render(<CityField search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), 'Z');
    await expect.element(page.getByText('Upiši barem 2 slova.')).toBeVisible();
    // Longer than the debounce: still nothing sent.
    await sleep(500);
    expect(search).not.toHaveBeenCalled();
  });

  it('uses the plural form for the minChars hint', async () => {
    const search = vi.fn(async () => [ZAGREB]);
    const screen = await render(<CityField minChars={5} search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), 'Za');
    await expect.element(page.getByText('Upiši barem 5 slova.')).toBeVisible();
    expect(search).not.toHaveBeenCalled();
  });

  it('searches once, about 300 ms after typing pauses, not once per key', async () => {
    let calledAt = 0;
    const search = vi.fn(async (_query: string) => {
      calledAt = performance.now();
      return [ZAGREB];
    });
    const screen = await render(<CityField search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), '10000');
    const typedAt = performance.now();
    expect(search).not.toHaveBeenCalled();

    await expect.poll(() => search.mock.calls.length).toBe(1);
    expect(search).toHaveBeenCalledWith('10000');
    expect(calledAt - typedAt).toBeGreaterThanOrEqual(200);

    // And no late calls for the shorter queries typed on the way.
    await sleep(400);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('trims the query before searching', async () => {
    const search = vi.fn(async (_query: string) => [ZAGREB]);
    const screen = await render(<CityField search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), ' Zag ');
    await expect.poll(() => search.mock.calls.length).toBe(1);
    expect(search).toHaveBeenCalledWith('Zag');
  });

  it('shows „Tražim…” at once while the search is pending, then the results', async () => {
    const request = deferred<City[]>();
    const search = vi.fn(() => request.promise);
    const screen = await render(<CityField search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), 'Za');
    // Before the debounce has even fired.
    await expect.element(page.getByText('Tražim…')).toBeVisible();
    await expect.element(page.getByRole('status', { name: 'Učitavanje' })).toBeVisible();
    await expect.poll(() => search.mock.calls.length).toBe(1);
    // Still pending: still loading, no „Nema rezultata” flash.
    await expect.element(page.getByText('Tražim…')).toBeVisible();
    await expect.element(page.getByText('Nema rezultata za „Za”.')).not.toBeInTheDocument();

    request.resolve([ZAGREB, ZADAR]);
    await expect.element(page.getByRole('option', { name: '10000 Zagreb' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: '23000 Zadar' })).toBeVisible();
    await expect.element(page.getByText('Tražim…')).not.toBeInTheDocument();
  });

  it('picking a result calls onValueChange with the item and fills the input with its label', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<CityField search={async () => [ZAGREB, ZADAR]} onValueChange={onValueChange} />);
    const input = screen.getByLabelText('Mjesto');

    await userEvent.type(input, 'Za');
    await page.getByRole('option', { name: '23000 Zadar' }).click();

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(ZADAR);
    await expect.element(input).toHaveValue('Zadar');
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
  });

  // Regression: a value the field mounted with (Postavke › Tvrtka, editing a partner) left the input empty (KAN-153).
  it('a value it mounts with fills the input and does not search for its own label', async () => {
    const search = vi.fn(async () => [ZAGREB]);
    const screen = await render(<CityField initial={ZAGREB} search={search} />);
    const input = screen.getByLabelText('Mjesto');

    await expect.element(input).toHaveValue('Zagreb');
    await input.click();
    await sleep(400);
    expect(search).not.toHaveBeenCalled();
  });

  it('after picking, opening the field again does not search for the picked label', async () => {
    const search = vi.fn(async (_query: string) => [ZAGREB, ZADAR]);
    const screen = await render(<CityField search={search} />);
    const input = screen.getByLabelText('Mjesto');

    await userEvent.type(input, 'Za');
    await page.getByRole('option', { name: '23000 Zadar' }).click();
    await expect.element(input).toHaveValue('Zadar');
    await input.click();
    await sleep(400);
    expect(search).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('option', { name: '23000 Zadar' })).toBeVisible();
  });

  it('the page resetting the value empties the input', async () => {
    function Resettable() {
      const [value, setValue] = React.useState<City | null>(null);
      return (
        <>
          <label htmlFor="city">Mjesto</label>
          <AsyncCombobox<City>
            getKey={(city) => city.id}
            getLabel={(city) => city.name}
            id="city"
            search={async () => [ZAGREB, ZADAR]}
            value={value}
            onValueChange={setValue}
          />
          <button type="button" onClick={() => setValue(null)}>
            Promijeni državu
          </button>
        </>
      );
    }
    const screen = await render(<Resettable />);
    const input = screen.getByLabelText('Mjesto');

    await userEvent.type(input, 'Za');
    await page.getByRole('option', { name: 'Zadar' }).click();
    await expect.element(input).toHaveValue('Zadar');
    await screen.getByRole('button', { name: 'Promijeni državu' }).click();
    await expect.element(input).toHaveValue('');
  });

  it('shows noResults(query) when nothing matches', async () => {
    const screen = await render(<CityField search={async () => []} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), 'Xyz');
    await expect.element(page.getByText('Nema rezultata za „Xyz”.')).toBeVisible();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('a custom noResults text', async () => {
    const screen = await render(
      <>
        <label htmlFor="c">Klijent</label>
        <AsyncCombobox<City>
          getKey={(city) => city.id}
          getLabel={(city) => city.name}
          id="c"
          noResults={(query) => `Nema klijenta „${query}”.`}
          search={async () => []}
          value={null}
          onValueChange={() => undefined}
        />
      </>
    );

    await userEvent.type(screen.getByLabelText('Klijent'), 'Kraš');
    await expect.element(page.getByText('Nema klijenta „Kraš”.')).toBeVisible();
  });

  it('a failed search stops loading and shows the no-results text', async () => {
    const request = deferred<City[]>();
    const search = vi.fn(() => request.promise);
    const screen = await render(<CityField search={search} />);

    await userEvent.type(screen.getByLabelText('Mjesto'), 'Za');
    await expect.element(page.getByText('Tražim…')).toBeVisible();
    // Reject only once the component holds the promise (else it is an unhandled rejection).
    await expect.poll(() => search.mock.calls.length).toBe(1);
    request.reject(new Error('Network'));

    await expect.element(page.getByText('Nema rezultata za „Za”.')).toBeVisible();
    await expect.element(page.getByText('Tražim…')).not.toBeInTheDocument();
  });

  it('ignores a slow answer to an older query', async () => {
    const first = deferred<City[]>();
    const second = deferred<City[]>();
    const search = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const screen = await render(<CityField search={search} />);
    const input = screen.getByLabelText('Mjesto');

    await userEvent.type(input, 'Za');
    await expect.poll(() => search.mock.calls.length).toBe(1);
    await userEvent.type(input, 'd');
    await expect.poll(() => search.mock.calls.length).toBe(2);
    expect(search).toHaveBeenLastCalledWith('Zad');

    second.resolve([ZADAR]);
    await expect.element(page.getByRole('option', { name: '23000 Zadar' })).toBeVisible();
    first.resolve([ZAGREB]);
    await sleep(100);
    await expect.element(page.getByRole('option', { name: '10000 Zagreb' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('option', { name: '23000 Zadar' })).toBeVisible();
  });

  it('disabled: the input cannot be used', async () => {
    const search = vi.fn(async () => [ZAGREB]);
    const screen = await render(<CityField disabled search={search} />);
    const input = screen.getByLabelText('Mjesto');

    await expect.element(input).toBeDisabled();
    await expect.element(page.getByRole('listbox')).not.toBeInTheDocument();
    for (const button of screen.container.querySelectorAll('button')) expect(button).toBeDisabled();
  });
});
