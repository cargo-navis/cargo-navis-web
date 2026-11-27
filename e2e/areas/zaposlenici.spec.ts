import type { Page } from '@playwright/test';

import { fail } from '../fake-api';
import { VOZAC } from '../fake-api/areas/zaposlenici';
import { expect, test } from '../support/test';
import { day } from '../support/time';
import { expectToast } from '../support/ui';

/** Fills the required fields of a new driver. */
async function fillDriver(page: Page) {
  await page.getByLabel('Ime', { exact: true }).fill('Marko');
  await page.getByLabel('Prezime', { exact: true }).fill('Novak');
  await page.getByLabel('Spol').selectOption('M');
  await page.getByPlaceholder('91 234 5678').fill('091 234 5678');
  await page.getByRole('checkbox', { name: 'Vozač' }).check();
}

const category = (page: Page, name: string) => page.getByRole('button', { name, exact: true });

test.describe('Zaposlenici', () => {
  test('list with groups and search', async ({ page }) => {
    await page.goto('/dashboard/employees');
    await expect(page.getByRole('tab', { name: /Vozači\s*2/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ivan Horvat' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Marija Kovač' })).toBeVisible();

    await page.getByLabel('Pretraži zaposlenike').fill('Petra');
    await expect(page.getByRole('link', { name: 'Petra Babić' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ivan Horvat' })).toBeHidden();
  });

  test('licence dates follow the categories', async ({ page }) => {
    await page.goto('/dashboard/employees/new');
    await page.getByRole('checkbox', { name: 'Vozač' }).check();
    await expect(page.getByText('Odaberi kategoriju da upišeš do kada vozačka vrijedi.')).toBeVisible();

    await category(page, 'B').click();
    await expect(page.getByText('Vozačka vrijedi do')).toBeVisible();
    await expect(page.getByText('Profesionalna vrijedi do')).toBeHidden();

    await category(page, 'CE').click();
    await expect(page.getByText('Profesionalna vrijedi do')).toBeVisible();

    await category(page, 'B').click();
    await expect(page.getByText('Vozačka vrijedi do')).toBeHidden();
    await expect(page.getByText('Profesionalna vrijedi do')).toBeVisible();
    // Tahograf is part of the driver section too.
    await expect(page.getByText('Broj tahografske kartice')).toBeVisible();
  });

  test('create a driver', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/employees/new');
    await page.getByRole('button', { name: 'Dodaj zaposlenika' }).click();
    // A new employee starts as a driver (Vozač ticked), so positions are already valid.
    for (const message of ['Upiši ime.', 'Upiši prezime.', 'Odaberi spol.', 'Upiši broj telefona.']) {
      await expect(page.getByText(message)).toBeVisible();
    }

    await fillDriver(page);
    await category(page, 'C').click();
    await category(page, 'CE').click();
    await page.getByRole('button', { name: 'Dodaj zaposlenika' }).click();

    await expectToast(page, 'Zaposlenik dodan', 'Marko Novak');
    await expect(page).toHaveURL(/\/dashboard\/employees\/[\w-]+$/);
    expect(fakeApi.calls('POST', '/api/employees')[0].body).toMatchObject({
      firstName: 'Marko',
      lastName: 'Novak',
      gender: 'M',
      phoneNumber: '+385912345678',
      positions: ['driver'],
      driverLicenceCategories: ['C', 'CE'],
    });
  });

  test('duplicate phone or email', async ({ page, fakeApi }) => {
    fakeApi.on('POST', '/api/employees', fail(409, 'Account with the same email or phone number already exists'));
    await page.goto('/dashboard/employees/new');
    await fillDriver(page);
    await page.getByRole('button', { name: 'Dodaj zaposlenika' }).click();
    await expectToast(page, 'Korisnik s ovom email adresom ili telefonom već postoji');
  });

  test('edit sends only what changed', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/employees/${VOZAC.petra}/edit`);
    await expect(page.getByRole('heading', { level: 1, name: 'Uredi: Petra Babić' })).toBeVisible();
    await page.getByLabel('Prezime', { exact: true }).fill('Babić Horvat');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();

    await expectToast(page, 'Zaposlenik ažuriran');
    expect(fakeApi.calls('PATCH', `/api/employees/${VOZAC.petra}`)[0].body).toEqual({ lastName: 'Babić Horvat' });
  });

  test('expiry warnings on the detail page', async ({ page, fakeApi }) => {
    const ivan = fakeApi.db.zaposlenici.find((employee) => employee.id === VOZAC.ivan)!;
    ivan.medicalExaminationExpiryDate = day(-3);
    ivan.driverTachographCardExpiryDate = day(20);

    await page.goto(`/dashboard/employees/${VOZAC.ivan}`);
    await expect(page.getByText('Istekle isprave')).toBeVisible();
    await expect(page.getByText('Liječnički pregled (isteklo 13.6.2026.)')).toBeVisible();
    await expect(page.getByText('Istječe za 20 d').first()).toBeVisible();
  });

  test('driver app invite link', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/employees/${VOZAC.ivan}`);
    await page.getByRole('button', { name: 'Pozivnica za aplikaciju' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Pozivnica za aplikaciju za vozače' });
    await expect(dialog.getByLabel('Link pozivnice')).toHaveValue(/\/driver\/e2e-driver-link-311$/);
    await expect(dialog.getByText('Pozivnica vrijedi 14 dana.')).toBeVisible();
    expect(fakeApi.calls('POST', `/api/employees/${VOZAC.ivan}/driver-portal-token`)).toHaveLength(1);
  });

  test('deactivate', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/employees/${VOZAC.petra}`);
    await page.getByRole('button', { name: 'Više akcija' }).click();
    await page.getByRole('menuitem', { name: 'Deaktiviraj' }).click();
    await page
      .getByRole('alertdialog', { name: 'Deaktivirati zaposlenika?' })
      .getByRole('button', { name: 'Deaktiviraj' })
      .click();

    await expectToast(page, 'Zaposlenik deaktiviran', 'Petra Babić');
    await expect(page.getByText('Zaposlenik je deaktiviran')).toBeVisible();
    expect(fakeApi.db.zaposlenici.find((employee) => employee.id === VOZAC.petra)?.deleted).toBe(true);
  });
});
