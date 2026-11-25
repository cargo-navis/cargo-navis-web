import { VOZILO } from '../fake-api/areas/vozila';
import { expect, test } from '../support/test';
import { day } from '../support/time';
import { expectToast } from '../support/ui';

test.describe('Flota', () => {
  test('list with type tabs', async ({ page }) => {
    await page.goto('/dashboard/fleet');
    await expect(page.getByRole('tab', { name: /Tegljači\s*2/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Poluprikolice\s*1/ })).toBeVisible();
    await expect(page.getByText('ZG-1234-AB')).toBeVisible();

    await page.getByRole('tab', { name: /Poluprikolice/ }).click();
    await expect(page).toHaveURL(/vrsta=poluprikolice/);
    await expect(page.getByText('ZG-900-PP')).toBeVisible();
    await expect(page.getByText('ZG-1234-AB')).toBeHidden();
  });

  test('expiry warnings: expired and due within 30 days', async ({ page, fakeApi }) => {
    const truck = fakeApi.db.vozila.find((vehicle) => vehicle.id === VOZILO.tegljac1)!;
    truck.registrationExpiryDate = day(-8);
    truck.tachographExpiryDate = day(10);

    await page.goto('/dashboard/fleet');
    const row = page.getByRole('row').filter({ hasText: 'ZG-1234-AB' });
    await expect(row).toContainText(/1 istek\w+ · 1 uskoro/);
    // The other truck is fine.
    await expect(page.getByRole('row').filter({ hasText: 'ZG-5678-CD' })).toContainText('Sve u roku');

    await page.goto(`/dashboard/fleet/${VOZILO.tegljac1}`);
    await expect(page.getByText('Istekli rokovi')).toBeVisible();
    await expect(page.getByText('Registracija (isteklo 8.6.2026.)')).toBeVisible();
    await expect(page.getByText('Isteklo prije 8 d').first()).toBeVisible();
    await expect(page.getByText('Istječe za 10 d').first()).toBeVisible();
  });

  test('create a tegljač', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/fleet/new?vrsta=tegljaci');
    await expect(page.getByRole('heading', { level: 1, name: 'Novo vozilo' })).toBeVisible();

    await page.getByRole('button', { name: 'Dodaj tegljač' }).click();
    await expect(page.getByText('Upiši registraciju.')).toBeVisible();
    expect(fakeApi.calls('POST', '/api/fleet')).toHaveLength(0);

    await page.getByLabel('Registracija', { exact: true }).fill('zg 4321-ef');
    await page.getByRole('button', { name: 'Dodaj tegljač' }).click();

    await expectToast(page, 'Vozilo dodano', 'ZG 4321-EF');
    await expect(page).toHaveURL(/\/dashboard\/fleet\/[\w-]+$/);
    expect(fakeApi.calls('POST', '/api/fleet')[0].body).toMatchObject({ type: 'TRUCK', registration: 'ZG 4321-EF' });
  });

  test('edit the registration', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/fleet/${VOZILO.tegljac2}/edit`);
    await expect(page.getByRole('heading', { level: 1, name: 'Uredi: ZG-5678-CD' })).toBeVisible();
    await page.getByLabel('Registracija', { exact: true }).fill('ZG-5678-XY');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();

    await expectToast(page, 'Vozilo ažurirano', 'ZG-5678-XY');
    await expect(page).toHaveURL(new RegExp(`/dashboard/fleet/${VOZILO.tegljac2}$`));
    expect(fakeApi.calls('PATCH', `/api/fleet/${VOZILO.tegljac2}`)[0].body).toEqual({
      registration: 'ZG-5678-XY',
      type: 'TRUCK',
    });
  });

  test('delete a vehicle', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/fleet/${VOZILO.tegljac2}`);
    await page.getByRole('button', { name: 'Više akcija' }).click();
    await page.getByRole('menuitem', { name: 'Obriši vozilo' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Obrisati vozilo?' });
    await expect(dialog).toContainText('ZG-5678-CD (Volvo FH)');
    await dialog.getByRole('button', { name: 'Obriši' }).click();

    await expectToast(page, 'Vozilo obrisano', 'ZG-5678-CD');
    expect(fakeApi.db.vozila.some((vehicle) => vehicle.id === VOZILO.tegljac2)).toBe(false);
  });

  test('error state', async ({ page, fakeApi }) => {
    fakeApi.fail('GET', '/api/fleet');
    await page.goto('/dashboard/fleet');
    await expect(page.getByText('Vozila se nisu učitala')).toBeVisible();
  });
});
