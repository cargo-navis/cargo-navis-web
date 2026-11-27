import { postalCode } from '../fake-api/areas/ostalo';
import { KLIJENT, PODVOZAR, VIES } from '../fake-api/areas/partneri';
import { expect, test } from '../support/test';
import { expectToast, pick } from '../support/ui';

test.describe('Klijenti', () => {
  test('list and search', async ({ page }) => {
    await page.goto('/dashboard/clients');
    await expect(page.getByRole('heading', { level: 1, name: 'Klijenti' })).toBeVisible();
    await expect(page.getByText('3 klijenta')).toBeVisible();
    await page.getByLabel('Pretraži klijente…').fill('kras');
    await expect(page.getByRole('link', { name: 'Kraš d.d.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Podravka d.d.' })).toBeHidden();
    await expect(page.getByText('1 od 3')).toBeVisible();
  });

  test('create via VIES', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/clients/new');
    await page.getByLabel('Popuni iz VIES-a').fill(`HR${VIES.ledo.number}`);
    await page.getByRole('button', { name: 'Pretraži', exact: true }).click();
    await expect(page.getByText(`Pronađeno: ${VIES.ledo.name} · podaci su upisani, provjeri ih ispod.`)).toBeVisible();
    await expect(page.getByLabel('Naziv tvrtke')).toHaveValue(VIES.ledo.name);
    await expect(page.getByLabel('Ulica i broj')).toHaveValue(VIES.ledo.street);

    await page.getByRole('button', { name: 'Dodaj klijenta' }).click();
    await expectToast(page, `Klijent ${VIES.ledo.name} dodan`);
    await expect(page).toHaveURL(/\/dashboard\/clients\/[\w-]+$/);
    expect(fakeApi.calls('POST', '/api/clients')[0].body).toMatchObject({
      name: VIES.ledo.name,
      taxId: `HR${VIES.ledo.number}`,
      addressName: VIES.ledo.street,
      addressPostalCodeId: postalCode('10000').id,
      notificationEmails: [],
    });
  });

  test('VIES: confirmed without details, and not found', async ({ page }) => {
    await page.goto('/dashboard/clients/new');
    const input = page.getByLabel('Popuni iz VIES-a');
    await input.fill(`DE${VIES.german.number}`);
    await page.getByRole('button', { name: 'Pretraži', exact: true }).click();
    await expect(page.getByText(/ne otkriva podatke o tvrtki\. Upiši ih ispod\./)).toBeVisible();

    await input.fill('HR99999999999');
    await page.getByRole('button', { name: 'Pretraži', exact: true }).click();
    await expect(page.getByText('Tvrtka nije pronađena u VIES-u. Podatke upiši ručno.')).toBeVisible();
  });

  test('edit a client', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/clients/${KLIJENT.kras}/edit`);
    await page.getByLabel('Naziv tvrtke').fill('Kraš prehrambena industrija d.d.');
    await page.getByRole('button', { name: 'Spremi promjene' }).click();
    await expectToast(page, 'Klijent Kraš prehrambena industrija d.d. ažuriran');
    expect(fakeApi.calls('PUT', `/api/clients/${KLIJENT.kras}`)[0].body).toMatchObject({
      name: 'Kraš prehrambena industrija d.d.',
    });
  });

  test('contacts: add one for every new nalog', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/clients/${KLIJENT.podravka}`);
    await page.getByLabel('Nova adresa').fill('nabava@podravka.test');
    await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
    await expectToast(page, 'Adresa dodana', 'nabava@podravka.test');
    expect(fakeApi.calls('PUT', `/api/clients/${KLIJENT.podravka}`)[0].body.notificationEmails).toEqual([
      { email: 'logistika@podravka.test', alwaysNotify: true },
      { email: 'nabava@podravka.test', alwaysNotify: true },
    ]);
  });

  test('delete a client with nalozi asks to type its name', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/clients/${KLIJENT.atlantic}`);
    await page.getByRole('button', { name: 'Više akcija' }).click();
    await page.getByRole('menuitem', { name: 'Obriši' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Obrisati klijenta Atlantic Grupa d.d.?' });
    await expect(dialog.getByText('Klijent ima 1 nalog.')).toBeVisible();
    const confirm = dialog.getByRole('button', { name: 'Obriši klijenta' });
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel('Potvrda').fill('atlantic');
    await confirm.click();

    await expectToast(page, 'Klijent Atlantic Grupa d.d. obrisan');
    await expect(page).toHaveURL(/\/dashboard\/clients$/);
    expect(fakeApi.calls('DELETE', `/api/clients/${KLIJENT.atlantic}`)).toHaveLength(1);
  });

  test('error state', async ({ page, fakeApi }) => {
    fakeApi.fail('GET', '/api/clients');
    await page.goto('/dashboard/clients');
    await expect(page.getByText('Popis se nije učitao')).toBeVisible();
  });
});

test.describe('Podvozari', () => {
  test('create by hand', async ({ page, fakeApi }) => {
    await page.goto('/dashboard/contractors/new');
    await page.getByRole('button', { name: 'Dodaj podvozara' }).click();
    await expect(page.getByText('Upiši naziv tvrtke.')).toBeVisible();
    await expect(page.getByText('Upiši valutu plaćanja.')).toBeVisible();

    await page.getByLabel('Naziv tvrtke').fill('Cesta d.o.o.');
    await page.getByLabel('Porezni broj').fill('HR12312312312');
    await page.getByLabel('Valuta plaćanja').fill('15');
    await page.getByLabel('Ulica i broj').fill('Riječka 10');
    await pick(page, page.getByRole('combobox', { name: 'Poštanski broj i mjesto' }), '51000', /51000\s*Rijeka/);
    await page.getByRole('button', { name: 'Dodaj podvozara' }).click();

    await expectToast(page, 'Podvozar Cesta d.o.o. dodan');
    expect(fakeApi.calls('POST', '/api/transport-contractors')[0].body).toMatchObject({
      name: 'Cesta d.o.o.',
      taxId: 'HR12312312312',
      termsOfPayment: 15,
      addressPostalCodeId: postalCode('51000').id,
    });
  });

  test('detail shows this year’s money; delete', async ({ page, fakeApi }) => {
    await page.goto(`/dashboard/contractors/${PODVOZAR.brzica}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Brzica prijevoz d.o.o.' })).toBeVisible();
    // 2026/0100: 2100 € charged, 1650 € paid.
    await expect(page.getByText('RUC').first()).toBeVisible();
    await expect(page.getByText(/450/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Više akcija' }).click();
    await page.getByRole('menuitem', { name: 'Obriši' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Obriši podvozara' }).click();
    await expectToast(page, 'Podvozar Brzica prijevoz d.o.o. obrisan');
    expect(fakeApi.db.partneri.contractors).toHaveLength(0);
  });
});
