import { manyNalozi } from '../fake-api/areas/nalozi';
import { expect, test } from '../support/test';
import { day } from '../support/time';

test.describe('Analitika', () => {
  test('Ukupno: totals, comparison to the previous period, top clients', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByRole('tab', { name: 'Ukupno' })).toHaveAttribute('aria-selected', 'true');

    // The default period (last 6 months) and the 6 months before it: count and price for each.
    await expect.poll(() => fakeApi.calls('GET', '/api/analytics/shipments/count').length).toBeGreaterThanOrEqual(2);
    const ranges = fakeApi.calls('GET', '/api/analytics/shipments/count').map((call) => call.query.get('to'));
    expect(ranges).toContain(day(0));

    await expect(page.getByRole('cell', { name: 'Podravka d.d.' })).toBeVisible();
    await expect(page.getByText(/od toga 1 agencijski/)).toBeVisible();
  });

  test('comparison with the previous period', async ({ page, fakeApi }) => {
    // One nalog in the 6 months before the default period (from 16.12.2025.), so there is something to compare to.
    const [old] = manyNalozi(1);
    old.createdAt = '2025-11-03T09:00:00.000Z';
    fakeApi.db.nalozi.push(old);
    await page.goto('/dashboard/analytics');
    await expect(page.getByText(/u odnosu na prethodnih 6 mjeseci/).first()).toBeVisible();
  });

  test('switch the granularity', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/analytics');
    await page.getByRole('button', { name: 'Tjedan' }).click();
    await expect(page).toHaveURL(/po=tjedan/);
    await expect
      .poll(() => fakeApi.calls('GET', '/api/analytics/shipments/count').at(-1)?.query.get('granularity'))
      .toBe('week');
  });

  test('switch the period', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/analytics');
    await page.getByRole('button', { name: /Zadnjih 6 mjeseci/ }).click();
    await page.getByRole('button', { name: 'Zadnja 3 mjeseca' }).click();
    // The 3 months to today, and the 3 months before them for the comparison.
    const froms = () => fakeApi.calls('GET', '/api/analytics/shipments/count').map((call) => call.query.get('from'));
    await expect.poll(froms).toContain('2026-03-16');
    await expect.poll(froms).toContain('2025-12-16');
  });

  test('Vlastiti prijevoz: per driver and per vehicle', async ({ page }) => {
    await page.goto('/dashboard/analytics?tab=regular');
    await expect(page.getByRole('cell', { name: /Ivan Horvat/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: /ZG-1234-AB/ })).toBeVisible();
  });

  test('Agencijski nalozi: per podvozar', async ({ page }) => {
    await page.goto('/dashboard/analytics?tab=agency');
    await expect(page.getByRole('cell', { name: /Brzica prijevoz/ })).toBeVisible();
  });

  test('no data for the period', async ({ page, fakeApi }) => {
    fakeApi.db.nalozi.length = 0;
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('Nema podataka za odabrano razdoblje.').first()).toBeVisible();
  });

  test('error state', async ({ page, fakeApi }) => {
    fakeApi.fail('GET', '/api/analytics/shipments/count');
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('Analitika se nije učitala')).toBeVisible();
  });
});
