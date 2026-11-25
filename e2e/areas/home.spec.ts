import { fail } from '../fake-api';
import { VOZILO } from '../fake-api/areas/vozila';
import { uuid } from '../fake-api/ids';
import { expect, test } from '../support/test';
import { at, day } from '../support/time';

test.describe('Početna', () => {
  test('greeting, active count and today’s utovari', async ({ page }) => {
    await page.goto('/dashboard');
    // NOW is 09:00; 2026/0101, 0102 and 0100 are not delivered yet.
    await expect(page.getByText('Dobro jutro, Marija · 3 aktivna naloga')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Danas · utorak, 16\. lipnja/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Podravka d\.d\..*#2026\/0101/ })).toBeVisible();
  });

  test('„Nefakturirano” leads to the filtered Nalozi list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Nefakturirano/ }).click();
    await expect(page).toHaveURL(/\/dashboard\/shipments/);
    await expect(page.getByText('Status fakture: Nefakturiran')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: '2026/0101' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: '2026/0099' })).toBeHidden();
  });

  test('„Danas utovara” leads to today’s utovari', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Danas utovara/ }).click();
    await expect(page.getByText('Spremno: 16.6.2026.')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: '2026/0101' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: '2026/0102' })).toBeHidden();
  });

  test('„Treba pažnju” lists expiry alerts; empty panels', async ({ page, fakeApi }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Nema upozorenja.')).toBeVisible();
    await expect(page.getByText('Nema novih obavijesti.')).toBeVisible();

    const truck = fakeApi.db.vozila.find((vehicle) => vehicle.id === VOZILO.tegljac1)!;
    truck.registrationExpiryDate = day(-2);
    fakeApi.db.ostalo.alerts.push({
      id: uuid(951),
      ruleName: 'VEH_REG_EXP' as never,
      alertable: truck,
      createdAt: at(-2, 6),
      updatedAt: at(-2, 6),
    });
    await page.reload();
    await expect(page.getByText('ZG-1234-AB · Registracija')).toBeVisible();
    await expect(page.getByText(/Istekla prije 2 d/)).toBeVisible();
  });

  test('a tile that fails to load offers a retry', async ({ page, fakeApi }) => {
    fakeApi.on('GET', '/api/shipments', (request, db) => {
      if (request.query.get('invoiceStatus') === 'not_sent') return fail(500);
      return fakeApi.normal(request, db);
    });
    await page.goto('/dashboard');
    await expect(page.getByText('Nije učitano.').first()).toBeVisible();
  });
});
