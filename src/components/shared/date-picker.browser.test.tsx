import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  DatePicker,
  type DateRange,
  DateRangePicker,
  expiryStartMonth,
  UPCOMING_DATE_RANGE_PRESETS,
} from './date-picker';

// „Today” is Tuesday 16.6.2026. (only Date is faked, so userEvent's timers keep running).
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 5, 16, 9));
});
afterEach(() => {
  vi.useRealTimers();
});

/**
 * A calendar day by its accessible name („utorak, 23. lipnja 2026.”); the calendar adds „, odabrano” to selected days
 * (and a prefix to today), so the name only has to contain it.
 */
const day = (name: string) =>
  page.getByRole('button', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
/** A selected day, as a screen reader announces it. */
const selectedDay = (name: string) => page.getByRole('button', { name: `${name}, odabrano`, exact: true });
const calendar = () => page.getByRole('dialog');
const monthDropdown = () => page.getByRole('combobox', { name: 'Odaberite mjesec' });
const yearDropdown = () => page.getByRole('combobox', { name: 'Odaberite godinu' });

function optionValues(select: Element) {
  return [...(select as HTMLSelectElement).options].map((option) => option.value);
}

// ---------------------------------------------------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------------------------------------------------

/** A form field holding the date, like the forms do. */
function DateField({
  initial = null,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'onChange'> & {
  initial?: Date | null;
  onChange?(value: Date | null): void;
}) {
  const [value, setValue] = React.useState<Date | null>(initial);
  return (
    <>
      <label htmlFor="date">Datum</label>
      <DatePicker
        id="date"
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        {...props}
      />
    </>
  );
}

describe('DatePicker', () => {
  it('shows the placeholder and no × while empty', async () => {
    const screen = await render(<DateField />);
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('Odaberi datum');
    await expect.element(screen.getByRole('button', { name: 'Obriši datum' })).not.toBeInTheDocument();
  });

  it('a custom placeholder replaces „Odaberi datum”', async () => {
    const screen = await render(<DateField placeholder="Bez roka" />);
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('Bez roka');
  });

  it('picking a day reports it, shows it formatted and closes the calendar', async () => {
    const onChange = vi.fn();
    const screen = await render(<DateField onChange={onChange} />);

    await screen.getByLabelText('Datum').click();
    await expect.element(calendar()).toBeVisible();
    // Empty: opens on today's month.
    await expect.element(monthDropdown()).toHaveValue('5');
    await expect.element(yearDropdown()).toHaveValue('2026');

    await day('utorak, 23. lipnja 2026.').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 5, 23));
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('23.6.2026.');
    await expect.element(calendar()).not.toBeInTheDocument();
  });

  it('opens on the picked date; clicking it again keeps the value', async () => {
    const onChange = vi.fn();
    const screen = await render(<DateField initial={new Date(2026, 1, 7)} onChange={onChange} />);
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('7.2.2026.');

    await screen.getByLabelText('Datum').click();
    await expect.element(monthDropdown()).toHaveValue('1');
    await expect.element(selectedDay('subota, 7. veljače 2026.')).toBeVisible();

    await day('subota, 7. veljače 2026.').click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(calendar()).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('7.2.2026.');
  });

  it('„Obriši datum” clears the date', async () => {
    const onChange = vi.fn();
    const screen = await render(<DateField initial={new Date(2026, 5, 20)} onChange={onChange} />);

    await screen.getByRole('button', { name: 'Obriši datum' }).click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('Odaberi datum');
    await expect.element(screen.getByRole('button', { name: 'Obriši datum' })).not.toBeInTheDocument();
    // Clearing doesn't open the calendar.
    await expect.element(calendar()).not.toBeInTheDocument();
  });

  it('disabled: no calendar and no ×', async () => {
    const screen = await render(<DateField disabled initial={new Date(2026, 5, 20)} />);
    await expect.element(screen.getByLabelText('Datum')).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Obriši datum' })).not.toBeInTheDocument();
  });

  it('invalid marks the trigger', async () => {
    const screen = await render(<DateField invalid />);
    await expect.element(screen.getByLabelText('Datum')).toHaveAttribute('aria-invalid', 'true');
  });

  describe('marked day', () => {
    const marked = { date: new Date(2026, 8, 23), label: 'Utovar', dotClassName: 'bg-loading-dot' };

    it('empty: opens on the marked month, with a dot on the day and a legend under the calendar', async () => {
      const screen = await render(<DateField marked={marked} />);
      await screen.getByLabelText('Datum').click();

      await expect.element(monthDropdown()).toHaveValue('8');
      await expect.element(yearDropdown()).toHaveValue('2026');
      const markedDay = day('srijeda, 23. rujna 2026.');
      await expect.element(markedDay).toBeVisible();
      expect(markedDay.element().querySelector('.bg-loading-dot')).not.toBeNull();
      // Only that day has the dot.
      expect(calendar().element().querySelectorAll('.bg-loading-dot')).toHaveLength(2); // the day + the legend
      await expect.element(calendar().getByText('Utovar 23.9.2026.')).toBeVisible();
    });

    it('with a value: opens on the value, the marked day still has its dot', async () => {
      const screen = await render(<DateField initial={new Date(2026, 8, 25)} marked={marked} />);
      await screen.getByLabelText('Datum').click();

      await expect.element(selectedDay('petak, 25. rujna 2026.')).toBeVisible();
      expect(day('srijeda, 23. rujna 2026.').element().querySelector('.bg-loading-dot')).not.toBeNull();
      expect(day('petak, 25. rujna 2026.').element().querySelector('.bg-loading-dot')).toBeNull();
    });

    it('opens on the value even when the marked day is in another month', async () => {
      const screen = await render(<DateField initial={new Date(2026, 10, 2)} marked={marked} />);
      await screen.getByLabelText('Datum').click();
      await expect.element(monthDropdown()).toHaveValue('10');
      await expect.element(calendar().getByText('Utovar 23.9.2026.')).toBeVisible();
    });

    it('no legend without a marked day', async () => {
      const screen = await render(<DateField />);
      await screen.getByLabelText('Datum').click();
      await expect.element(calendar()).toBeVisible();
      await expect.element(calendar().getByText('Utovar', { exact: false })).not.toBeInTheDocument();
    });
  });

  describe('month / year dropdowns', () => {
    it('default: from 100 years back to December 10 years ahead', async () => {
      const screen = await render(<DateField />);
      await screen.getByLabelText('Datum').click();

      const years = optionValues(yearDropdown().element());
      expect(years[0]).toBe('1926');
      expect(years.at(-1)).toBe('2036');
      await userEvent.selectOptions(yearDropdown(), '2036');
      expect(optionValues(monthDropdown().element()).at(-1)).toBe('11');
    });

    it('expiry dates: from January 6 years back to December 10 years ahead', async () => {
      expect(expiryStartMonth()).toEqual(new Date(2020, 0, 1));
      const screen = await render(<DateField startMonth={expiryStartMonth()} />);
      await screen.getByLabelText('Datum').click();

      expect(optionValues(yearDropdown().element())).toEqual(
        Array.from({ length: 2036 - 2020 + 1 }, (_, index) => String(2020 + index))
      );

      await userEvent.selectOptions(yearDropdown(), '2020');
      await userEvent.selectOptions(monthDropdown(), '0');
      await expect.element(day('srijeda, 1. siječnja 2020.')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Prijeđi na prethodni mjesec' }))
        .toHaveAttribute('aria-disabled', 'true');

      await userEvent.selectOptions(yearDropdown(), '2036');
      await userEvent.selectOptions(monthDropdown(), '11');
      await expect.element(day('srijeda, 31. prosinca 2036.')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Prijeđi na sljedeći mjesec' }))
        .toHaveAttribute('aria-disabled', 'true');
    });

    it('picking a far year from the dropdown, then a day', async () => {
      const onChange = vi.fn();
      const screen = await render(<DateField startMonth={expiryStartMonth()} onChange={onChange} />);
      await screen.getByLabelText('Datum').click();

      await userEvent.selectOptions(yearDropdown(), '2031');
      await userEvent.selectOptions(monthDropdown(), '2');
      await day('petak, 14. ožujka 2031.').click();
      expect(onChange).toHaveBeenCalledExactlyOnceWith(new Date(2031, 2, 14));
      await expect.element(screen.getByLabelText('Datum')).toHaveTextContent('14.3.2031.');
    });
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// DateRangePicker
// ---------------------------------------------------------------------------------------------------------------------

function RangeField({
  initial,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof DateRangePicker>, 'value' | 'onChange'> & {
  initial?: DateRange;
  onChange?(value: DateRange | undefined): void;
}) {
  const [value, setValue] = React.useState<DateRange | undefined>(initial);
  return (
    <DateRangePicker
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
}

/** The trigger is the only button outside the popover. */
const rangeTrigger = (screen: Awaited<ReturnType<typeof render>>) => screen.getByRole('button').first();
const preset = (label: string) => calendar().getByRole('button', { name: label, exact: true });

describe('DateRangePicker', () => {
  // Regression: with no range the trigger read „Ukupno · Ukupno” (KAN-153).
  it('no range: the trigger says „Ukupno”', async () => {
    const screen = await render(<RangeField />);
    await expect.element(rangeTrigger(screen)).toHaveTextContent('Ukupno');
    expect(rangeTrigger(screen).element().textContent).toBe('Ukupno');
  });

  it('a preset reports its range and the trigger shows „<preset> · <range>”', async () => {
    const onChange = vi.fn();
    const screen = await render(<RangeField onChange={onChange} />);

    await rangeTrigger(screen).click();
    await preset('Zadnja 3 mjeseca').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ from: new Date(2026, 2, 16, 9), to: new Date(2026, 5, 16, 9) });
    await expect.element(rangeTrigger(screen)).toHaveTextContent('Zadnja 3 mjeseca · 16.3.2026. – 16.6.2026.');
    await expect.element(calendar()).not.toBeInTheDocument();

    await rangeTrigger(screen).click();
    await expect.element(preset('Zadnja 3 mjeseca')).toHaveAttribute('data-variant', 'secondary');
    await expect.element(preset('Od početka godine')).toHaveAttribute('data-variant', 'ghost');
    await preset('Od početka godine').click();
    await expect.element(rangeTrigger(screen)).toHaveTextContent('Od početka godine · 1.1.2026. – 16.6.2026.');
  });

  it('„Ukupno” removes the limit', async () => {
    const onChange = vi.fn();
    const screen = await render(
      <RangeField initial={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 16) }} onChange={onChange} />
    );
    await expect.element(rangeTrigger(screen)).toHaveTextContent('Od početka godine · 1.1.2026. – 16.6.2026.');

    await rangeTrigger(screen).click();
    await preset('Ukupno').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
    await expect.element(calendar()).not.toBeInTheDocument();
  });

  it('a range matching no preset shows just the dates', async () => {
    const screen = await render(<RangeField initial={{ from: new Date(2026, 4, 4), to: new Date(2026, 4, 20) }} />);
    await expect.element(rangeTrigger(screen)).toHaveTextContent('4.5.2026. – 20.5.2026.');
    expect(rangeTrigger(screen).element().textContent).toBe('4.5.2026. – 20.5.2026.');
  });

  it('two clicks pick a range (in either order) and only then report it', async () => {
    const onChange = vi.fn();
    const screen = await render(<RangeField onChange={onChange} />);

    await rangeTrigger(screen).click();
    await day('srijeda, 10. lipnja 2026.').click();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(calendar()).toBeVisible();

    await day('petak, 5. lipnja 2026.').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ from: new Date(2026, 5, 5), to: new Date(2026, 5, 10) });
    await expect.element(rangeTrigger(screen)).toHaveTextContent('5.6.2026. – 10.6.2026.');
    await expect.element(calendar()).not.toBeInTheDocument();
  });

  it('the same day twice = that day', async () => {
    const onChange = vi.fn();
    const screen = await render(<RangeField onChange={onChange} />);

    await rangeTrigger(screen).click();
    await day('srijeda, 10. lipnja 2026.').click();
    await day('srijeda, 10. lipnja 2026.').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ from: new Date(2026, 5, 10), to: new Date(2026, 5, 10) });
    await expect.element(rangeTrigger(screen)).toHaveTextContent('10.6.2026. – 10.6.2026.');
  });

  it('closing after one click keeps the previous range, and the next opening starts over', async () => {
    const onChange = vi.fn();
    const screen = await render(
      <RangeField initial={{ from: new Date(2026, 4, 4), to: new Date(2026, 4, 20) }} onChange={onChange} />
    );

    await rangeTrigger(screen).click();
    await day('srijeda, 13. svibnja 2026.').click();
    await userEvent.keyboard('{Escape}');
    await expect.element(calendar()).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(rangeTrigger(screen)).toHaveTextContent('4.5.2026. – 20.5.2026.');

    // The first click after reopening is a new start again, not the end of the abandoned range.
    await rangeTrigger(screen).click();
    await day('utorak, 12. svibnja 2026.').click();
    expect(onChange).not.toHaveBeenCalled();
    await day('petak, 15. svibnja 2026.').click();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ from: new Date(2026, 4, 12), to: new Date(2026, 4, 15) });
  });

  it('looking back: days after today are disabled; the range ends on the right month', async () => {
    const screen = await render(<RangeField initial={{ from: new Date(2026, 0, 1), to: new Date(2026, 4, 20) }} />);
    await rangeTrigger(screen).click();

    // Anchored a month before the end: April + May, so the end is visible.
    await expect.element(day('srijeda, 20. svibnja 2026.')).toBeVisible();
    await expect.element(day('srijeda, 15. travnja 2026.')).toBeVisible();

    await page.getByRole('button', { name: 'Prijeđi na sljedeći mjesec' }).click();
    await expect.element(day('utorak, 16. lipnja 2026.')).toBeEnabled();
    await expect.element(day('srijeda, 17. lipnja 2026.')).toBeDisabled();
  });

  describe('upcoming (Nalozi, `future`)', () => {
    it('week presets follow Croatian weeks (Monday–Sunday)', async () => {
      const onChange = vi.fn();
      const screen = await render(<RangeField future presets={UPCOMING_DATE_RANGE_PRESETS} onChange={onChange} />);

      await rangeTrigger(screen).click();
      await preset('Ovaj tjedan').click();
      expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 15, 9), to: new Date(2026, 5, 21, 9) });
      await expect.element(rangeTrigger(screen)).toHaveTextContent('Ovaj tjedan · 15.6.2026. – 21.6.2026.');

      await rangeTrigger(screen).click();
      await preset('Sljedeći tjedan').click();
      await expect.element(rangeTrigger(screen)).toHaveTextContent('Sljedeći tjedan · 22.6.2026. – 28.6.2026.');

      await rangeTrigger(screen).click();
      await preset('Sutra').click();
      await expect.element(rangeTrigger(screen)).toHaveTextContent('Sutra · 17.6.2026. – 17.6.2026.');

      await rangeTrigger(screen).click();
      await preset('Zadnjih 7 dana').click();
      await expect.element(rangeTrigger(screen)).toHaveTextContent('Zadnjih 7 dana · 10.6.2026. – 16.6.2026.');
    });

    it('a picked range matching a preset shows the preset', async () => {
      const screen = await render(<RangeField future presets={UPCOMING_DATE_RANGE_PRESETS} />);
      await rangeTrigger(screen).click();
      await day('utorak, 16. lipnja 2026.').click();
      await day('utorak, 16. lipnja 2026.').click();
      await expect.element(rangeTrigger(screen)).toHaveTextContent('Danas · 16.6.2026. – 16.6.2026.');
    });

    it('days after today can be picked; the calendar opens on the range start', async () => {
      const onChange = vi.fn();
      const screen = await render(
        <RangeField
          future
          initial={{ from: new Date(2026, 7, 3), to: new Date(2026, 7, 7) }}
          presets={UPCOMING_DATE_RANGE_PRESETS}
          onChange={onChange}
        />
      );
      await rangeTrigger(screen).click();

      await expect.element(day('ponedjeljak, 3. kolovoza 2026.')).toBeVisible();
      await day('ponedjeljak, 10. kolovoza 2026.').click();
      await day('srijeda, 12. kolovoza 2026.').click();
      expect(onChange).toHaveBeenCalledExactlyOnceWith({ from: new Date(2026, 7, 10), to: new Date(2026, 7, 12) });
    });
  });
});
