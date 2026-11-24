import type { Page } from '@playwright/test';

import { postalCode } from '../fake-api/areas/ostalo';
import { KLIJENT } from '../fake-api/areas/partneri';
import { uuid } from '../fake-api/ids';
import { expect, test } from '../support/test';

/** Fills the „Detalji utovara” / „Detalji istovara” dialog and confirms it. */
async function fillStop(
  page: Page,
  kind: 'utovar' | 'istovar',
  stop: { company: string; street: string; postal: string; place: string }
) {
  await page.getByRole('button', { name: `Dodaj ${kind}` }).click();
  const dialog = page.getByRole('dialog', { name: `Detalji ${kind === 'utovar' ? 'utovara' : 'istovara'}` });
  await dialog.getByLabel('Tvrtka').fill(stop.company);
  await dialog.getByLabel('Ulica i broj').fill(stop.street);
  await dialog.getByRole('combobox', { name: 'Država' }).fill('Hrvatska');
  await page.getByRole('option', { name: 'Hrvatska' }).click();
  await dialog.getByRole('combobox', { name: 'Poštanski broj i mjesto' }).fill(stop.postal);
  await page.getByRole('option', { name: `${stop.postal} ${stop.place}` }).click();
  await dialog.getByRole('button', { name: `Potvrdi ${kind}` }).click();
  await expect(dialog).toBeHidden();
}

test('create a nalog by hand', async ({ page, fakeApi }) => {
  await page.goto('/dashboard/shipments');
  await page.getByRole('button', { name: 'Dodaj nalog' }).click();
  await expect(page).toHaveURL(/\/dashboard\/shipments\/new$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Novi nalog' })).toBeVisible();

  await page.getByRole('combobox', { name: 'Klijent' }).fill('Atlantic');
  await page.getByRole('option', { name: /Atlantic Grupa d\.d\./ }).click();
  await page.getByRole('textbox', { name: 'Cijena', exact: true }).fill('850');
  await page.getByRole('textbox', { name: 'Broj paleta', exact: true }).fill('10');
  await page.getByRole('textbox', { name: 'Težina', exact: true }).fill('6000');

  await fillStop(page, 'utovar', {
    company: 'Atlantic Grupa d.d.',
    street: 'Miramarska 23',
    postal: '10000',
    place: 'Zagreb',
  });
  await fillStop(page, 'istovar', {
    company: 'Konzum Split',
    street: 'Domovinskog rata 2',
    postal: '21000',
    place: 'Split',
  });

  await page.getByRole('button', { name: 'Kreiraj nalog' }).click();

  // Saved: the toast, then step 2 (assign a vehicle) of the new nalog.
  await expect(page.getByText('Nalog #2026/0103 dodan').first()).toBeVisible();
  // The first id a handler creates in every test (e2e/fake-api/ids.ts), whatever ran before in this worker.
  await expect(page).toHaveURL(new RegExp(`/dashboard/shipments/${uuid(10_001)}/assign\\?created=1$`));

  const [request] = fakeApi.calls('POST', '/api/shipments');
  expect(request.body).toMatchObject({
    clientId: KLIJENT.atlantic,
    price: 850,
    cargo: [
      {
        weight: 6000,
        metadata: { palleteAmount: 10 },
        loadingAddress: { streetName: 'Miramarska 23', postalCodeId: postalCode('10000').id },
        loadingCompanyName: 'Atlantic Grupa d.d.',
        unloadingAddress: { streetName: 'Domovinskog rata 2', postalCodeId: postalCode('21000').id },
        unloadingCompanyName: 'Konzum Split',
      },
    ],
  });
  expect(fakeApi.db.nalozi.map((nalog) => nalog.orderNumber)).toContain('2026/0103');
});
