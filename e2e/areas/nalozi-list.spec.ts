import type { Page } from '@playwright/test';

import { manyNalozi, NALOG } from '../fake-api/areas/nalozi';
import { expect, test } from '../support/test';
import { day } from '../support/time';
import { expectToast, isPhone } from '../support/ui';

/** The list row of a nalog, by its number. */
const row = (page: Page, orderNumber: string) => page.getByRole('row').filter({ hasText: orderNumber });

/** Order numbers of the rows on screen, top to bottom. */
async function orderNumbers(page: Page) {
  const texts = await page.getByRole('row').allInnerTexts();
  return texts.map((text) => /2026\/\d{4}/.exec(text)?.[0]).filter(Boolean);
}

test.describe('Nalozi list', () => {
  test('lists the nalozi, newest first', async ({ page }) => {
    await page.goto('/dashboard/shipments');
    await expect(page.getByRole('heading', { level: 1, name: 'Nalozi' })).toBeVisible();
    await expect(row(page, '2026/0102')).toBeVisible();
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0102', '2026/0101', '2026/0100', '2026/0099']);
    await expect(page.getByText('Prikazano 1–4 od 4 rezultata').first()).toBeVisible();
  });

  test('a row opens the quick look (desktop) or the nalog (phone)', async ({ page }, testInfo) => {
    await page.goto('/dashboard/shipments');
    await row(page, '2026/0101').click();

    if (isPhone(testInfo)) {
      await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${NALOG.podravka}$`));
      return;
    }
    // The quick look is named after the client.
    const sheet = page.getByRole('dialog', { name: 'Podravka d.d.' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('#2026/0101')).toBeVisible();
    await expect(sheet.getByRole('heading', { name: 'Utovari i istovari' })).toBeVisible();
    await sheet.getByRole('button', { name: 'Otvori nalog' }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${NALOG.podravka}$`));
  });

  test('Status utovara: chip, request, removal; survives a reload', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: 'Status utovara' }).click();
    await page.getByRole('menuitemradio', { name: 'Istovareno' }).click();

    await expect(page.getByText('Status utovara: Istovareno')).toBeVisible();
    await expect.poll(() => fakeApi.calls('GET', '/api/shipments').at(-1)?.query.get('loadStatus')).toBe('unloaded');
    await expect(row(page, '2026/0099')).toBeVisible();
    await expect(row(page, '2026/0101')).toBeHidden();

    // Filters are kept per browser (localStorage), so a reload shows the same list.
    await page.reload();
    await expect(page.getByText('Status utovara: Istovareno')).toBeVisible();
    await expect(row(page, '2026/0101')).toBeHidden();

    const chip = page.getByText('Status utovara: Istovareno').locator('..');
    await chip.getByRole('button', { name: 'Ukloni filter' }).click();
    await expect(page.getByText('Nema aktivnih filtera.')).toBeVisible();
    await expect(row(page, '2026/0101')).toBeVisible();
  });

  test('Više filtera › Status fakture, and „Očisti filtere”', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: /Više filtera/ }).click();
    await page.getByLabel('Status fakture').click();
    await page.getByRole('option', { name: 'Fakturiran', exact: true }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByText('Status fakture: Fakturiran')).toBeVisible();
    await expect.poll(() => fakeApi.calls('GET', '/api/shipments').at(-1)?.query.get('invoiceStatus')).toBe('sent');
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0099']);

    await page.getByRole('button', { name: 'Očisti filtere' }).first().click();
    await expect(page.getByText('Nema aktivnih filtera.')).toBeVisible();
    await expect(row(page, '2026/0102')).toBeVisible();
  });

  test('date control: Utovar ili istovar, then only Istovar; old pairs from links', async ({ page, fakeApi }) => {
    const lastQuery = () => fakeApi.calls('GET', '/api/shipments').at(-1)?.query;
    await page.goto('/dashboard/shipments');

    // „Sutra” = 17.6.: 0101 unloads, 0102 loads; by default both, by the date that matched (a tie: by order number).
    await page.getByRole('button', { name: 'Svi datumi' }).click();
    await page.getByRole('button', { name: 'Sutra', exact: true }).click();
    await expect(page.getByText('Utovar ili istovar: 17.6.2026.')).toBeVisible();
    await expect.poll(() => lastQuery()?.get('activityDateFrom')).toBe(day(1));
    expect(lastQuery()?.get('activityDateTo')).toBe(day(1));
    expect(lastQuery()?.get('sort')).toBe('activityDate,asc');
    await expect(page.getByRole('combobox', { name: 'Poredaj' })).toHaveText('Po datumu');
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0101', '2026/0102']);

    // The type keeps the range: only istovari tomorrow.
    await page.getByRole('button', { name: /Sutra · 17\.6\.2026\./ }).click();
    await page
      .getByRole('group', { name: 'Vrsta datuma' })
      .getByRole('button', { name: 'Istovar', exact: true })
      .click();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Istovar: 17.6.2026.')).toBeVisible();
    await expect.poll(() => lastQuery()?.get('unloadingDueDateFrom')).toBe(day(1));
    expect(lastQuery()?.get('activityDateFrom')).toBeNull();
    expect(lastQuery()?.get('sort')).toBe('unloadingDueDate,asc');
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0101']);

    // An old link with a utovar and an istovar range keeps the utovar one.
    await page.goto(`/dashboard/shipments?loadingReadyDateFrom=${day(1)}&unloadingDueDateFrom=${day(4)}`);
    await expect(page.getByText('Utovar: 17.6.2026. – …')).toBeVisible();
    await expect.poll(() => lastQuery()?.get('unloadingDueDateFrom')).toBeNull();
    expect(lastQuery()?.get('loadingReadyDateFrom')).toBe(day(1));
  });

  test('a filter in the URL is applied, then dropped from the URL', async ({ page }) => {
    // Početna's cards link like this.
    await page.goto('/dashboard/shipments?invoiceStatus=sent');
    await expect(page.getByText('Status fakture: Fakturiran')).toBeVisible();
    await expect(page).not.toHaveURL(/invoiceStatus/);
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0099']);
  });

  test('no results for the filters', async ({ page }) => {
    await page.goto('/dashboard/shipments?invoiceStatus=paid');
    await expect(page.getByText('Nema naloga za odabrane filtere')).toBeVisible();
    await page.getByRole('button', { name: 'Očisti filtere' }).last().click();
    await expect(row(page, '2026/0102')).toBeVisible();
  });

  test('sorting by price', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('combobox', { name: 'Poredaj' }).click();
    await page.getByRole('option', { name: 'Cijena ↓' }).click();

    await expect.poll(() => fakeApi.calls('GET', '/api/shipments').at(-1)?.query.get('sort')).toBe('price,desc');
    // 2100 €, 1450 €, 1200 €, 980 €
    await expect.poll(() => orderNumbers(page)).toEqual(['2026/0100', '2026/0101', '2026/0099', '2026/0102']);
  });

  test('pagination', async ({ page, fakeApi }) => {
    fakeApi.db.nalozi.push(...manyNalozi(30));
    await page.goto('/dashboard/shipments');
    await expect(page.getByText('Prikazano 1–25 od 34 rezultata').first()).toBeVisible();

    await page
      .getByRole('button', { name: 'Sljedeća stranica' })
      .or(page.getByRole('link', { name: 'Sljedeća stranica' }))
      .first()
      .click();
    await expect(page.getByText('Prikazano 26–34 od 34 rezultata').first()).toBeVisible();
    await expect.poll(() => fakeApi.calls('GET', '/api/shipments').at(-1)?.query.get('page')).toBe('2');
    await expect(page).toHaveURL(/page=2/);
  });

  test('empty: no nalozi yet', async ({ page, fakeApi }) => {
    fakeApi.empty('GET', '/api/shipments');
    await page.goto('/dashboard/shipments');
    await expect(page.getByText('Još nema naloga')).toBeVisible();
    await expect(page.getByText('Dodaj prvi nalog ručno ili učitaj PDF od klijenta.')).toBeVisible();
  });

  test('server error, then retry', async ({ page, fakeApi }) => {
    fakeApi.fail('GET', '/api/shipments', 500, { times: 1 });
    await page.goto('/dashboard/shipments');
    await expect(page.getByText('Nalozi se nisu učitali')).toBeVisible();
    await page.getByRole('button', { name: 'Pokušaj ponovno' }).click();
    await expect(row(page, '2026/0102')).toBeVisible();
  });
});

test.describe('Nalozi row menu', () => {
  test('offers every action', async ({ page }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: 'Akcije za nalog 2026/0101' }).click();
    const menu = page.getByRole('menu');
    for (const item of ['Otvori', 'Uredi', 'Kopiraj nalog', 'Preuzmi PDF', 'Obriši nalog']) {
      await expect(menu.getByRole('menuitem', { name: item, exact: true }).first()).toBeVisible();
    }
    // The current status shows next to it.
    await expect(menu.getByRole('menuitem', { name: /^Status fakture/ })).toContainText('Nefakturiran');
    // With the driver's name under it.
    await expect(menu.getByRole('menuitem', { name: /^Obavijesti vozača/ })).toContainText('Ivan Horvat');
  });

  test('right-click adds „Otvori u novom tabu”', async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo), 'No right-click on a phone.');
    await page.goto('/dashboard/shipments');
    await row(page, '2026/0101').click({ button: 'right' });
    const newTab = page.getByRole('menuitem', { name: 'Otvori u novom tabu' });
    await expect(newTab).toHaveAttribute('href', `/dashboard/shipments/${NALOG.podravka}`);
    await expect(newTab).toHaveAttribute('target', '_blank');
  });

  test('„Kopiraj nalog” opens the form with a copy', async ({ page }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: 'Akcije za nalog 2026/0102' }).click();
    await page.getByRole('menuitem', { name: 'Kopiraj nalog' }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/new\\?copyFromId=${NALOG.atlantic}`));
  });

  test('invoice status from the menu', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: 'Akcije za nalog 2026/0102' }).click();
    await page.getByRole('menuitem', { name: /^Status fakture/ }).click();
    await page.getByRole('menuitemradio', { name: 'Plaćen' }).click();

    await expectToast(page, 'Status fakture: Plaćen');
    expect(fakeApi.calls('PATCH', `/api/shipments/${NALOG.atlantic}`)[0].body).toEqual({ invoiceStatus: 'paid' });
  });

  test('delete: cancel keeps it, confirm removes it', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/shipments');
    const openDelete = async () => {
      await page.getByRole('button', { name: 'Akcije za nalog 2026/0102' }).click();
      await page.getByRole('menuitem', { name: 'Obriši nalog' }).click();
      return page.getByRole('alertdialog', { name: 'Obrisati nalog #2026/0102?' });
    };

    let dialog = await openDelete();
    await expect(dialog.getByText('Atlantic Grupa d.d.. Ovo se ne može poništiti.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Odustani' }).click();
    await expect(dialog).toBeHidden();
    expect(fakeApi.calls('DELETE')).toHaveLength(0);

    dialog = await openDelete();
    await dialog.getByRole('button', { name: 'Obriši' }).click();
    await expectToast(page, 'Nalog #2026/0102 obrisan');
    await expect(row(page, '2026/0102')).toBeHidden();
    expect(fakeApi.db.nalozi.some((nalog) => nalog.id === NALOG.atlantic)).toBe(false);
  });

  test('delete fails: error toast, the nalog stays', async ({ page, fakeApi }) => {
    fakeApi.fail('DELETE', '/api/shipments/:id');
    await page.goto('/dashboard/shipments');
    await page.getByRole('button', { name: 'Akcije za nalog 2026/0102' }).click();
    await page.getByRole('menuitem', { name: 'Obriši nalog' }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Obriši' }).click();
    await expectToast(page, 'Nalog nije obrisan');
    // The dialog stays open to try again; once closed, the nalog is still there.
    await dialog.getByRole('button', { name: 'Odustani' }).click();
    await expect(row(page, '2026/0102')).toBeVisible();
  });
});
