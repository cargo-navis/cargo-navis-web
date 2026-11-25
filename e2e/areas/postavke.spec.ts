import { postalCode } from '../fake-api/areas/ostalo';
import { expect, test } from '../support/test';
import { expectToast } from '../support/ui';

const LOGO = { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('png') };

test.describe('Postavke › Moj račun', () => {
  test('profile, and a password change with rules', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/settings/account');
    await expect(page.getByRole('heading', { level: 1, name: 'Postavke' })).toBeVisible();
    await expect(page.getByText('dispecer@e2e.cargo-navis.test').first()).toBeVisible();

    const password = page.getByLabel('Nova lozinka', { exact: true });
    const confirm = page.getByLabel('Ponovi novu lozinku', { exact: true });
    await password.fill('kratka');
    await confirm.fill('kratka');
    await page.getByRole('button', { name: 'Promijeni lozinku' }).click();
    await expect(page.getByText('Lozinka mora imati najmanje 10 znakova')).toBeVisible();

    await password.fill('NovaLozinka2026');
    await confirm.fill('NovaLozinka2027');
    await page.getByRole('button', { name: 'Promijeni lozinku' }).click();
    await expect(page.getByText('Lozinke se ne podudaraju')).toBeVisible();
    expect(fakeApi.calls('POST', '/api/account/password')).toHaveLength(0);

    await confirm.fill('NovaLozinka2026');
    await page.getByRole('button', { name: 'Promijeni lozinku' }).click();
    await expectToast(page, 'Lozinka promijenjena');
    expect(fakeApi.calls('POST', '/api/account/password')[0].body).toEqual({ password: 'NovaLozinka2026' });
    await expect(password).toHaveValue('');
  });
});

test.describe('Postavke › Tvrtka', () => {
  test('save company data', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/settings/company');
    const name = page.getByLabel('Naziv tvrtke');
    await expect(name).toHaveValue('Navis Transport d.o.o.');
    await name.fill('Navis Logistika d.o.o.');
    await expect(page.getByText('Imaš nespremljene promjene.')).toBeVisible();
    await page.getByRole('button', { name: 'Spremi promjene' }).click();

    await expectToast(page, 'Podaci tvrtke ažurirani');
    expect(fakeApi.calls('PUT', '/api/tenant')[0].body).toMatchObject({
      name: 'Navis Logistika d.o.o.',
      address: { streetName: 'Radnička cesta 1', postalCodeId: postalCode('10000').id },
    });
  });

  test('save fails: error toast, changes kept', async ({ page, fakeApi }) => {
    fakeApi.fail('PUT', '/api/tenant');
    await page.goto('/dashboard/settings/company');
    await page.getByLabel('Naziv tvrtke').fill('Navis Logistika d.o.o.');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();
    await expectToast(page, 'Dogodila se greška s ažuriranjem podataka tvrtke');
    await expect(page.getByLabel('Naziv tvrtke')).toHaveValue('Navis Logistika d.o.o.');
  });

  test('logo upload: each upload shows its new URL', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/settings/company');
    let chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Dodaj logo' }).first().click();
    await (await chooser).setFiles(LOGO);
    await expectToast(page, 'Logo ažuriran');
    const logo = page.getByRole('img', { name: 'Navis Transport d.o.o.' }).first();
    await expect(logo).toHaveAttribute('src', /upload=1$/);

    chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Promijeni', exact: true }).click();
    await (await chooser).setFiles(LOGO);
    await expect(logo).toHaveAttribute('src', /upload=2$/);
    expect(fakeApi.calls('POST', '/api/tenant/logo')).toHaveLength(2);
  });
});

test.describe('Postavke › old URLs', () => {
  for (const [from, to] of [
    ['/dashboard/settings', '/dashboard/settings/account'],
    ['/dashboard/tenant', '/dashboard/settings/company'],
    ['/dashboard/tenant/edit', '/dashboard/settings/company'],
  ]) {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
    });
  }
});
